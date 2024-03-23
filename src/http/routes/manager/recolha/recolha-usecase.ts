import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import type { decodedUserFilialIdProps, deleteRecolhaProps, recolhaByIdProps } from "../../../../../index-types";
interface findRecolhaProps extends decodedUserFilialIdProps {
  client: string,
  driver: string
}


export class RecolhaUseCase {
  async find({ filialId, client: clientName, driver: driverName }: findRecolhaProps) {
    const startDate = dayjs().subtract(1, "M");
    return await db.recolha.findMany({
      where: {
        filialId,
        createdAt: {
          gte: startDate.startOf("day").toDate(),
        },
        client: {
          name: {
            contains: clientName
          }
        }
        , driver: {
          name: {
            contains: driverName
          }
        }
      },
      select: {
        id: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        status: true,
        createdAt: true,
      },
    });
  }
  async findById({ recolhaId, filialId }: recolhaByIdProps) {
    console.log("aqui")
    const recolha = await db.recolha.findFirst({
      where: {
        id: recolhaId,
        filialId: {
          equals: filialId,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        duration: true,
        distance: true,
        client: {
          select: {
            name: true,
            tel: true,
            email: true,
          },
        },
        driver: {
          select: {
            name: true,
            veiculo: {
              select: {
                matricula: true,
              },
            },
          },
        },
        filial: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!recolha) {
      throw new Error("Recolha não encontrada!")
    }
    return recolha
  }
  async delete({ id, filialId, recolhaId }: deleteRecolhaProps) {

    if (
      !(await db.recolha.findUnique({
        where: {
          id: recolhaId,
          filial: {
            id: filialId,
            managerId: id
          }
        },
      }))
    ) {
      throw Error("Recolha não encontrada!");
    }

    await db.recolha.delete({
      where: {
        id: recolhaId,
      },
    });
  }
}
