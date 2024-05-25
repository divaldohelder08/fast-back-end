import { db } from "../../../db/connection";
import { encrypt } from "../../../lib/jose";
import type { decodedUserProps } from "../../../types";
import { prisma } from "../../../utils/prisma-throws";
import type { authenticateData } from "./manager";

class ManagerUseCase {
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
  async signOut(filialId: string) {
    await db.filial.updateMany({
      data: {
        status: "fechado",
      },
      where: {
        id: filialId,
      },
    });
    await db.agents.updateMany({
      data: {
        status: "Off",
      },
      where: {
        filialId,
      },
    });
    await db.driver.updateMany({
      data: {
        status: "Off",
      },
      where: {
        filialId,
      },
    });
  }
  async profile({ id }: decodedUserProps) {
    await prisma.manager.findError(id)
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
    if (!user || !user.manager) {
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
    await db.filial.updateMany({
      data: {
        status: "aberta",
      },
      where: {
        id: filialId,
      },
    });
    return {
      user: userInfo,
      token,
    };
  }
}

export const managerUseCase = new ManagerUseCase();
