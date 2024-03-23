import dayjs from "dayjs";
import type {
  decodedUserFilialIdProps,
  driverByIdExtendedProps,
  geoMapFilter,
} from "../../../../../index-types";
import { db } from "../../../../db/connection";
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

export class DriverUseCase {
  async create({
    numberBI,
    name,
    tel,
    email,
    nascimento,
    matricula,
    sexo,
    avatar,
    filialId,
  }: createDriver) {
    if (
      await db.veiculo.findUnique({
        where: {
          matricula,
        },
      })
    )
      throw new Error("Matricula já registrada");

    if (
      await db.driver.findUnique({
        where: {
          numberBI,
        },
      })
    )
      throw new Error("Bilhete já registrada");

    if (
      await db.driver.findUnique({
        where: {
          email,
        },
      })
    )
      throw new Error("Email já registrada");

    if (
      await db.driver.findUnique({
        where: {
          tel,
        },
      })
    )
      throw new Error("Telefone já registrada");

    return await db.veiculo.create({
      data: {
        matricula,
        driver: {
          create: {
            numberBI,
            name,
            avatar,
            tel,
            email,
            sexo,
            nascimento,
            filialId,
            coordenadas: (
              await db.filial.findUnique({
                where: {
                  id: filialId,
                },
              })
            )?.coordenadas,
          },
        },
      },
    });
  }
  async find({ filialId }: decodedUserFilialIdProps) {
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
    if (!driver) {
      throw new Error("Motorista ñ encontrado!");
    }
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
    return {
      driver,
      heatMap: heatData.map((e) => {
        return {
          date: dayjs(e.createdAt).format("YYYY/MM/DD"),
          count: e._count,
        };
      }),
      row: {
        finalizada: rowValue[0] ? rowValue[0]._count : 0,
        cancelada: rowValue[1] ? rowValue[1]._count : 0,
      },
    };
  }
  async delete({ id, key, driverId, filialId }: deleteClientProps) {
    if (
      !(await db.manager.findUnique({
        where: {
          id,
          password: key,
        },
      }))
    ) {
      throw Error("Senha manager");
    }

    if (
      !(await db.driver.findUnique({
        where: {
          id: driverId,
          filialId,
        },
      }))
    ) {
      throw Error("Motorista não encontrado!");
    }

    await db.driver.delete({
      where: {
        id: driverId,
        filialId,
      },
    });
  }
  async updateStatus({ id, status, filialId }: updateStatusProps) {
    if (
      !(await db.driver.findFirst({
        where: {
          id,
          filialId,
        },
      }))
    )
      throw new Error("Motorista não encontrado!");

    await db.driver.update({
      data: {
        status,
      },
      where: {
        id,
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
    return
  }
  async geoMap({ filialId, numberBI }: geoMapFilter) {
    return await db.driver.findMany({
      select: {
        id: true,
        numberBI:true,
        name: true,
        coordenadas: true,
      },
      where: {
        filialId,
        numberBI: {
          contains: numberBI
        }
      },
    });
  }
}
