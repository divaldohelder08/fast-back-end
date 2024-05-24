import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import { prisma } from "../../../../utils/prisma-throws";

export class RecolhaUseCase {
  async findById(id: string) {
    const recolha = await db.recolha.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        distance: true,
        duration: true,
        status: true,
        createdAt: true,
        comment: true,
        directions: true,
        driver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            tel: true,
            veiculo: {
              select: {
                matricula: true,
              },
            },
          },
        },
      },
    });
    if (!recolha)
      throw new Error("Recolha não encontrada")
    return recolha
  }
  async delivered(clientId: string) {
    await prisma.client.find(clientId);
    return await db.recolha.findMany({
      where: {
        clientId,
        status: "finalizada",
      },
      select: {
        id: true,
        distance: true,
        driver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            tel: true,
            veiculo: {
              select: {
                matricula: true,
              },
            },
          },
        },
        duration: true,
        status: true,
        createdAt: true,
        comment: true,
      },
    });

  }
  async inAndamento(clientId: string) {
    await prisma.client.find(clientId);
    return await db.recolha.findMany({
      where: {
        clientId,
        status: "andamento",
      },
      select: {
        id: true,
        distance: true,
        driver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            tel: true,
            veiculo: {
              select: {
                matricula: true,
              },
            },
          },
        },
        duration: true,
        status: true,
        createdAt: true,
        comment: true,
      },
    });
  }
  async create({ clientId, filialId }: { clientId: string, filialId: string }) {
    await prisma.client.find(clientId)
    const now = dayjs().startOf("hours").set("hour", 1).toDate()
    const filial = await db.filial.findUnique(
      {
        where: {
          id: filialId,
          status: "aberta"
        }
      }
    )
    if (!filial) throw new Error("A filial não se encontra aberta")
    const avaliablesDrivers = await db.driver.findMany({
      where: {
        filialId,
        status: "On",
      },
      orderBy: {
        recolhas: {
          _count: "asc",
        },
      },
      take: 1,
    });

    if (!avaliablesDrivers[0]) throw new Error("Nenhum motorista se encontra a trabalhar");

    const driver = avaliablesDrivers[0];

    if (!driver) throw new Error("Nenhum motorista se encontra a trabalhar")
    return await db.recolha.create({
      data: {
        clientId,
        driverId: driver.id,
        filialId,
        status: "pendente",
      },
      select: {
        id: true,
        status: true,
        driver: {
          select: {
            name: true,
            tel: true,
            avatar: true
          }
        }
      }
    });
  }
  async handleCancel(id: string) {
    const ifExist = await db.recolha.findFirst({
      where: { id },
    });
    if (!ifExist) throw new Error("Recolha não encontrada");
    await db.recolha.update({
      where: {
        id,
      },
      data: {
        status: "cancelada",
      },
    });
  }
  async updateComment({ clientId, comment, id }: { clientId: string, id: string, comment: string }) {
    await prisma.client.find(clientId)
    const recolha = await db.recolha.findFirst({
      where: {
        id,
        clientId
      }
    })
    if (!recolha) throw new Error("Recolha não encontrada")

    await db.recolha.update({
      where: {
        id,
      },
      data: {
        comment
      }
    })
  }
}
