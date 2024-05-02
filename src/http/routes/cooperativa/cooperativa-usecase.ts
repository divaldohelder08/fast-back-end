import { db } from "../../../db/connection";
import { encrypt } from "../../../lib/jose";
import type { decodedUserIdProps } from "../../../types";
import type { authenticateData } from "./cooperativa";

export class CooperativaUseCase {
  async user(id: string) {
    return await db.manager.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
      },
    });
  }
  async profile({ id }: decodedUserIdProps) {
    return await db.manager.findFirst({
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
  async authenticate({ email, password }: authenticateData) {
    const user = await db.manager.findFirst({
      where: {
        role: "superGerente",
        email,
        password,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const token = await encrypt({ id: user.id });
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
