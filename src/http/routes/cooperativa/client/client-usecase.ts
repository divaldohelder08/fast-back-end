import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import type { decodedUserIdProps, geoMapFilter1 } from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";

interface deleteClientProps extends decodedUserIdProps {
  clintId: string;
  key: string;
}

export class ClientUseCase {
  async find() {
    return await db.client.findMany({
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
  async delete({ id, key, clintId }: deleteClientProps) {
    await prisma.manager.autorize({
      id,
      password: key,
    });
    await prisma.client.find(clintId);
    await db.client.delete({
      where: {
        id: clintId,
      },
    });
  }
  async findById({ id }: decodedUserIdProps) {
    await prisma.client.find(id);
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
        },
        select: {
          avatar: true,
          name: true,
          email: true,
          createdAt: true,
          tel: true,
          status: true,
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
  async geoMap({ numberBI }: geoMapFilter1) {
    return await db.client.findMany({
      select: {
        id: true,
        numberBI: true,
        name: true,
        coordenadas: true,
      },
      where: {
        numberBI: {
          contains: numberBI,
        },
      },
    });
  }
}
