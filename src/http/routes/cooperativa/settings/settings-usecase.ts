import { db } from "../../../../db/connection";
import type { decodedUserIdProps, updateKeyProps } from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";

interface updateProfileType extends decodedUserIdProps {
  name: string;
  email: string;
  avatar?: string | null;
}

interface updateTelProps extends decodedUserIdProps {
  tel: string;
}

export class SettingsUseCase {
  async getOverView() {
    return {
      clients: await db.client.count(),
      drivers: await db.driver.count(),
      recolhas: await db.recolha.count(),
      filias: await db.filial.count(),
      agents: await db.agents.count(),
    };
  }
  async getManagers() {
    return await db.manager.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        filial: true,
        role: true,
      },
    });
  }
  async updateKey({ antiga, id, nova }: updateKeyProps) {
    const manager = await db.manager.findUnique({
      where: {
        password: antiga,
        id,
      },
    });
    if (!manager) {
      throw Error("Senha atual incorreta");
    }

    await db.manager.update({
      where: {
        id: manager.id,
      },
      data: {
        password: nova,
      },
    });
  }
  async updateProfile({ avatar, email, name, id }: updateProfileType) {
    await prisma.manager.findError(id)
    await db.manager.update({
      where: {
        id,
      },
      data: {
        avatar,
        email,
        name,
      },
    });
  }
  async updateTel({ tel, id }: updateTelProps) {
    await db.manager.update({
      where: {
        id,
      },
      data: {
        tel,
      },
    });
  }
  async getPrice() {
    const price = await db.price.findFirst();
    if (!price) throw new Error("Preço não encontrado");
    return price;
  }
  async updatePrice({
    password,
    price,
    managerId,
  }: {
    password: string;
    price: number;
    managerId: string;
  }) {
    if (
      !(await db.manager.findUnique({
        where: {
          id: managerId,
          password,
        },
      }))
    )
      throw new Error("Senha do super-gerente invalida");

    const priceId = await db.price.findFirst();
    if (!priceId) throw new Error("Preço não encontrado");
    await db.price.update({
      data: {
        price,
        managerId,
      },
      where: {
        id: priceId.id,
      },
    });
  }
}
