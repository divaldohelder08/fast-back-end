import dayjs from "dayjs";
import { db } from "../../../db/connection";
import { encrypt } from "../../../lib/jose";
import { LastPayment } from "../../../utils/last-payment";
import type { authenticateData } from "./agent";
import chalk from "chalk";

class AgentUseCase {
  async profile(id: string) {
    return db.agents.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        createdAt: true,
        tel: true,
      },
    });
  }

  async updateProfile(id: string) {
    return db.agents.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        createdAt: true,
        tel: true,
      },
    });
  }

  async findById(agentId: string) {
    const old = await db.agents.findFirst({
      where: {
        id: agentId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        tel: true,
        status: true,
        filial: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
        createdAt: true,
      },
    });

    if (!old) throw new Error("Agente não encontrado!");
    const {
      filial: { name },
      ...rest
    } = old;
    return { ...rest, filial: name };
  }
  async makePayment({
    clientId,
    agentId,
  }: {
    clientId: string;
    agentId: string;
  }) {
    await db.client.update({
      where: {
        id: clientId,
      },
      data: {
        status: "pago",
        payment: {
          update: {
            agentId,
            endAt: dayjs().add(1, "month").startOf("day").toDate(),
          },
        },
      },
    });
  }

  async getPrice() {
    const payment = await LastPayment();
    if (!payment) throw new Error("Preço não encontrado");
    return payment;
  }
  async authenticate({ email, filialId }: authenticateData) {
    const userI = await db.agents.findFirst({
      where: {
        email,
        filialId,
        status: "On",
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        tel: true,
        filial: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!userI || !userI.filial) throw new Error("Credenciais inválidas");

    const user = {
      id: userI.id,
      name: userI.name,
      email: userI.email,
      avatar: userI.avatar,
      tel: userI.tel,
      filial: {
        id: userI.filial.id,
        name: userI.filial.name,
      },
    };

    const token = await encrypt({
      id: user.id,
      filialId: user.filial.id,
    });
    console.log(chalk.yellow("New user logged"))
    console.log(user, "agent");
    return {
      user,
      token,
    };
  }
}

export const agentUseCase = new AgentUseCase();
