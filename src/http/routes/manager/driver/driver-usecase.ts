import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import type { driverByIdExtendedProps, geoMapFilter } from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";
import type { createDriverProps, updateStatusData } from "./driver";

interface decodedUserProps {
  id: string;
  filialId: string;
}

interface deleteClientProps extends decodedUserProps {
  driverId: string;
  key: string;
}
interface createDriver extends createDriverProps {
  filialId: string;
}
interface updateStatusProps extends updateStatusData {
  filialId: string;
  id: string;
}

interface updateAllStatusProps extends updateStatusData {
  filialId: string;
}

export class DriverUseCase {
  async create({ numberBI, tel, email, matricula, ...rest }: createDriver) {
    await prisma.driver.matriculaError(matricula);
    await prisma.driver.numberBIError(matricula);
    await prisma.driver.emailError(email);
    await prisma.driver.telError(tel);

    return await db.veiculo.create({
      data: {
        matricula,
        driver: {
          create: {
            numberBI,
            tel,
            email,
            ...rest,
          },
        },
      },
    });
  }
  async find(filialId: string) {
    return await db.driver.findMany({
      where: {
        filialId,
      },
      select: {
        id: true,
        numberBI: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
        veiculo: {
          select: {
            matricula: true,
          },
        },
      },
    });
  }
  async findById({ id, filialId }: driverByIdExtendedProps) {
    const driver = await db.driver.findFirst({
      where: {
        filialId,
        id,
      },
      select: {
        avatar: true,
        name: true,
        email: true,
        createdAt: true,
        tel: true,
        coordenadas:true,
        veiculo: {
          select: {
            matricula: true,
          },
        },
        filial: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!driver) throw new Error("Motorista ñ encontrado!");

    const rowValue = await db.recolha.groupBy({
      by: ["status"],
      where: {
        driverId: id,
        status: {
          in: ["finalizada", "cancelada"],
        },
      },
      _count: true,
    });

    const heatData = await db.recolha.groupBy({
      by: ["createdAt"],
      where: {
        driverId: id,
        status: {
          in: ["finalizada", "cancelada"],
        },
      },
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
    });


    const groupedByDay: { [key: string]: { count: number; data: string } } = {};

    heatData.forEach((e) => {
      const date = new Date(e.createdAt);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString();
      if (!groupedByDay[dateKey]) {
        groupedByDay[dateKey] = { count: 0, data: dateKey };
      }
      groupedByDay[dateKey].count += e._count;
    });



    return {
      driver,
      heatMap: Object.values(groupedByDay).map((e) => ({
        count: e.count,
        date: dayjs(e.data).format("YYYY/MM/DD"),
      })),
      row: {
        finalizada: rowValue[0] ? rowValue[0]._count : 0,
        cancelada: rowValue[1] ? rowValue[1]._count : 0,
      },
    };
  }
  async delete({ id, key, driverId, filialId }: deleteClientProps) {
    await prisma.manager.autorize({
      id,
      password: key,
    });

    await prisma.driver.findOnFilial({
      id: driverId,
      filialId,
    });

    await db.driver.delete({
      where: {
        id: driverId,
        filialId,
      },
    });
  }
  async updateFilial({ id, filialId, key, managerId }: { id: string, key: string, filialId: string, managerId: string }) {
    await prisma.driver.find(id)
    await prisma.manager.autorize({
      id: managerId,
      password: key,
    });

    await db.driver.update({
      data: {
        filialId,
      },
      where: {
        id,
      },
    });
    return;
  }
  async updateStatus({ id, status, filialId }: updateStatusProps) {
    await prisma.driver.findOnFilial({
      id,
      filialId,
    });

    await db.driver.update({
      data: {
        status,
      },
      where: {
        id,
        filialId,
      },
    });
    return;
  }
  async updateAllStatus({ status, filialId }: updateAllStatusProps) {
    await db.driver.updateMany({
      data: {
        status,
      },
      where: {
        filialId,
      },
    });
  }
  async geoMap({ filialId, numberBI }: geoMapFilter) {
    return await db.driver.findMany({
      select: {
        id: true,
        numberBI: true,
        name: true,
        coordenadas: true,
        avatar: true,
        email: true,
      },
      where: {
        filialId,
        numberBI: {
          contains: numberBI,
        },
      },
    });
  }
}
