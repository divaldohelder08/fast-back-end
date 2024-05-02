import { resolveNaptr } from "node:dns";
import { db } from "../../../db/connection";
import { encrypt } from "../../../lib/jose";
import type { clientAuthData } from "./client";
import { stat } from "node:fs";
import { prisma } from "../../../utils/prisma-throws";
import { LastPayment } from "../../../utils/last-payment";

export class ClientUseCase {
  async profile(id: string) {
    const user = await db.client.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        address: true,
        tel: true,
        nascimento: true,
        createdAt: true,
        status: true,
        filial: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
    if (!user) throw new Error("Cliente não encontrado");

    const { filial, address, status, ...rest } = user;
    const split = filial.address.split(", ");
    const split1 = address.split(", ");
    return {
      address: {
        município: split1[0],
        bairro: split1[1],
        rua: split1[2],
        casa: split1[3],
      },
      status: status === "pago" ? status : "Não-Pago",
      filial: {
        município: split[0],
        bairro: split[1],
      },
      ...rest,
    };
  }
  async dashboard(id: string) {
    await prisma.client.find(id);
    const pay = await db.client.findUnique({
      where: {
        id,
      },
      select: {
        payment: {
          select: {
            updateAt: true,
          },
        },
      },
    });
    const { price } = await LastPayment();
    return {
      price,
      lastPayment: pay?.payment.updateAt,
      recolhas: {
        total: await db.recolha.count({
          where: {
            clientId: id,
            status: {
              in: ["cancelada", "finalizada"],
            },
          },
        }),
        canceladas: await db.recolha.count({
          where: {
            clientId: id,
            status: "cancelada",
          },
        }),
        finalizadas: await db.recolha.count({
          where: {
            clientId: id,
            status: "finalizada",
          },
        }),
      },
    };
     
  }
  async authenticate({ email, password }: clientAuthData) {
    const user = await db.client.findFirst({
      where: {
        email,
        password,
      },
      select: {
        id: true,
        name: true,
        email: true,
        filial: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!user || !user.filial) throw new Error("Credenciais inválidas");
    const token = await encrypt({
      id: user.id,
      filialId: user.filial.id,
    });
    console.log({
      user,
      token,
    });
    return {
      user,
      token,
    };
  }
}
