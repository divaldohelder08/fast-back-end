import dayjs from "dayjs";

import { db } from "../../../../db/connection";
import { prisma } from "../../../../utils/prisma-throws";

export class DriverUseCase {
  async find() {
    const old = await db.driver.findMany({
      select: {
        id: true,
        numberBI: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
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
    return old.map((e) => {
      const {
        filial: { name },
        ...rest
      } = e;
      return { ...rest, filial: name };
    });
  }
  async findById(id: string) {
    await prisma.driver.find(id);
    const driver = await db.driver.findFirst({
      where: {
        id,
      },
      select: {
        avatar: true,
        name: true,
        email: true,
        createdAt: true,
        tel: true,
        coordenadas: true,
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
      heatMap:Object.values(groupedByDay).map((e) => ({
      count: e.count,
      date: dayjs(e.data).format("YYYY/MM/DD"),
    })),
      row: {
        finalizada: rowValue[0] ? rowValue[0]._count : 0,
        cancelada: rowValue[1] ? rowValue[1]._count : 0,
      },
    };
  }
  async delete({
    key,
    driverId,
    id,
  }: {
    driverId: string;
    key: string;
    id: string;
  }) {
    await prisma.manager.autorize({
      id,
      password: key,
    });
    await prisma.driver.find(driverId);
    await db.driver.delete({
      where: {
        id: driverId,
      },
    });
  }
  async geoMap({ numberBI }: { numberBI: string }) {
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
        numberBI: {
          contains: numberBI,
        },
      },
    });
  }
}
