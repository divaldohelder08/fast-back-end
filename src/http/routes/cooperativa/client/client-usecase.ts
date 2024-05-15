import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import type { clientByIdProps, decodedUserIdProps, geoMapFilter1 } from "../../../../types";
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
          address:true,
          coordenadas:true,
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
      heatMap: Object.values(groupedByDay).map((e) => ({
        count: e.count,
        date: dayjs(e.data).format("YYYY/MM/DD"),
      })),
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
