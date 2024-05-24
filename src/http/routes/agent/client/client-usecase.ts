import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import { LastPayment } from "../../../../utils/last-payment";
import type { formData, formEditData } from "./client";
import { prisma } from "../../../../utils/prisma-throws";

interface editProps extends formEditData {
  id: string;
  agentId: string;
}

interface createClient extends formData {
  filialId: string;
  agentId: string;
}
export class ClientUseCase {
  async findById(id: string) {
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

    const client = await db.client.findFirst({
      where: {
        id: {
          contains: id,
        },
      },
      select: {
        avatar: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
        tel: true,
        address: true,
        coordenadas: true,
        numberBI:true,
        payment: {
          select: {
            endAt: true,
          },
        },
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
    });
    if (!client) return;

    const {
      filial: { name },
      _count: { recolhas },
      payment: { endAt },
      ...rest
    } = client;
    return {
      client: {
        ...rest,
        filial: name,
        recolhas,
        endAt,
      },
    heatMap: Object.values(groupedByDay).map((e) => ({
      count: e.count,
      date: dayjs(e.data).format("YYYY/MM/DD"),
    })),
    };
  }
  async findByBI(numberBI: string) {
    return await db.client.findMany({
      select: {
        id: true,
        numberBI: true,
        name: true,
        avatar: true,
        email: true,
        status: true,
      },
      where: {
        numberBI: {
          contains: numberBI,
        },
      },
    });
  }
  async pay({
    id,
    agentId,
    key: password,
  }: {
    id: string;
    agentId: string;
    key: string;
  }) {
    await prisma.agents.autorize({
      id: agentId,
      password,
    });

    const priceId = await LastPayment();
    await db.client.update({
      data: {
        status: "pago",
        payment: {
          update: {
            endAt: dayjs().add(1, "month").startOf("day").toDate(),
            agentId,
            priceId: priceId.id,
          },
        },
      },
      where: {
        id,
      },
    });
    return;
  }
  async create({ agentId, numberBI, email, tel, ...rest }: createClient) {
    await prisma.client.numberBIError(numberBI);
    await prisma.client.emailError(email);
    await prisma.client.telError(tel);
    const priceId = await LastPayment();

    await db.payment.create({
      data: {
        endAt: dayjs().add(1, "month").startOf("day").toDate(),
        agentId,
        priceId: priceId.id,
        Client: {
          create: {
            status: "pago",
            numberBI,
            email,
            tel,
            ...rest,
          },
        },
      },
    });
  }
  async edit({ address, agentId, coordenadas, id }: editProps) {
    await db.client.update({
      data: {
        address,
        coordenadas,
        payment: {
          update: {
            agentId,
          },
        },
      },
      where: {
        id,
      },
    });
  }
}
