import chalk from "chalk";
import { db } from "../../../db/connection";
import { encrypt } from "../../../lib/jose";
import type { decodedUserIdProps } from "../../../types";
import type { authenticateData } from "./cooperativa";
import { prisma } from "../../../utils/prisma-throws";

export class CooperativaUseCase {
  async user(id: string) {
    await prisma.manager.findError(id)
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
    await prisma.manager.findError(id)
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
    console.log(chalk.yellow("New user logged"))
    console.log(user, 'cooperativa');
    return {
      user,
      token,
    };
  }
}
