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

    const filial = await db.filial.findUnique(
      {
        where: {
          id: filialId,
          status: "aberta"
        }
      }
    )
    if (!filial) throw new Error("A filial não se encontra aberta")

    const driver = await db.driver.findFirst({
      where: {
        filialId,
        status: "On",
      }
    })

    if (!driver) throw new Error("Nenhum motorista se encontra a trabalhar")

    return await db.recolha.create({
      data: {
        clientId,
        driverId: driver?.id,
        filialId,
        status: "pendente",
      },
      select: {
        id: true,
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

}
