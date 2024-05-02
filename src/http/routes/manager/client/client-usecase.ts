import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import type { clientByIdProps, geoMapFilter } from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";

interface decodedUserProps {
  id: string;
  filialId: string;
}

interface deleteClientProps extends decodedUserProps {
  clintId: string;
  key: string;
}

export class ClientUseCase {
  async find(filialId: string) {
    return await db.client.findMany({
      where: {
        filialId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        numberBI: true,
        nascimento: true,
        createdAt: true,
      },
    });
  }
  async delete({ id, key, clintId, filialId }: deleteClientProps) {
    await prisma.manager.autorize({ id, password: key });
    await prisma.client.findOnFilial({
      id: clintId,
      filialId,
    });
    await db.client.delete({
      where: {
        id: clintId,
        filialId,
      },
    });
  }
  async findById({ id, filialId }: clientByIdProps) {
    await prisma.client.findOnFilial({
      id,
      filialId,
    });

    const heatData = await db.recolha.groupBy({
      by: ["createdAt"],
      where: {
        clientId: id,
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
      client: await db.client.findUnique({
        where: {
          id,
          filialId,
        },
        select: {
          avatar: true,
          name: true,
          email: true,
          createdAt: true,
          status: true,
          tel: true,
          filial: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              recolhas: true,
            },
          },
        },
      }),
      heatMap: heatData.map((e) => {
        return {
          date: dayjs(e.createdAt).format("YYYY/MM/DD"),
          count: e._count,
        };
      }),
    };
  }
  async geoMap({ filialId, numberBI }: geoMapFilter) {
    return await db.client.findMany({
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
