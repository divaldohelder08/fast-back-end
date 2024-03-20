import { db } from "../../../db/connection";
import dayjs from "dayjs";
import type { authenticateData, filialStatusData } from "./agent";
import { encrypt } from "../../../lib/jose";
import type {
  decodedUserFilialIdProps,
  decodedUserIdProps,
} from "../../../../index-types";

interface FindByBi {
  numberBi: string;
}

export class AgentUseCase {
  async profile({ id }: decodedUserIdProps) {
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
  async findByBi({ numberBi }: FindByBi) {
    const client = await db.client.findFirst({
      where: {
        numberBI: {
          contains: numberBi,
        },
      },
    });
    if (!client) throw new Error("Cliente não encontrado!");
    return client;
  }
  async makePayment({ clientId, agentId }: { clientId: string,agentId:string }) {
await db.payment.findFirst({
  where:{
    clientId,
  },
  orderBy:{
    createdAt:"asc"
  }
})

      await db.payment.create({
        data: {
          endAt: dayjs().add(1, "month").startOf("day").toDate(),
          clientId,
          agentId,
        },
      });
  }
  async authenticate({ email, password }: authenticateData) {
    const user = await db.agents.findFirst({
      where: {
        email,
        password,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        filial: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!user || !user.filial) throw new Error("Credenciais inválidas");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      filial: {
        id: user.filial.id,
        name: user.filial.name,
      },
    };

    const token = await encrypt({
      id: userInfo.id,
      filialId: userInfo.filial.id,
    });
    console.log({
      user: userInfo,
      token,
    });
    return {
      user: userInfo,
      token,
    };
  }
}
