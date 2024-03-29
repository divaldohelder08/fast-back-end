import { db } from "../../../db/connection";
import type { authenticateData } from "./manager";
import { encrypt } from "../../../lib/jose";
import type { decodedUserProps } from "../../../../index-types";

export class ManagerUseCase {
  async clients({ filialId }: decodedUserProps) {
    return await db.client.findMany({
      where: {
        filialId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        numberBI: true,
        nascimento: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  async profile({ id }: decodedUserProps) {
    return db.manager.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        role: true,
        createdAt: true,
        tel: true,
      },
    });
  }
  async authenticate({ email, filialId, password }: authenticateData) {
    const user = await db.filial.findFirst({
      where: {
        AND: [
          { id: filialId },
          {
            manager: {
              role: "gerente",
              email,
              password,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    console.log(user);
    if (!user || !user.manager) {
      console.log("erro");
      throw new Error("Credenciais inválidas");
    }
    const userInfo = {
      id: user.manager.id,
      name: user.manager.name,
      email: user.manager.email,
      avatar: user.manager.avatar,
      filial: {
        id: user.id,
        name: user.name,
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
