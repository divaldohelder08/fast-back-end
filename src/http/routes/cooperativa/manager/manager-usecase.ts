import { db } from "../../../../db/connection";
import { prisma } from "../../../../utils/prisma-throws";

export class ManagerUseCase {
  async find() {
    const manager = await db.manager.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        role: true,
        createdAt: true,
        tel: true,
      },
      orderBy: {
        role: "asc",
      },
    });

    const promises = manager.map(async (e) => {
      const filial = await db.filial.findFirst({
        where: {
          managerId: e.id,
        },
      });
      const { ...rest } = e;
      if (!filial) {
        return { ...rest, filial: null };
      }
      return { ...rest, filial: filial.name, filialId: filial.id };
    });
    return await Promise.all(promises);
  }
  async delete({
    id,
    key,
    managerId,
  }: {
    managerId: string;
    key: string;
    id: string;
  }) {
    await prisma.manager.autorize({ id, password: key });

    const manager = await db.manager.findUnique({
      where: {
        id: managerId,
        role: "gerente",
      },
    });
    if (!manager) throw Error("Gerente não encontrado");

    await db.filial.updateMany({
      data: {
        status: "fechado",
      },
      where: {
        managerId: manager.id,
      },
    });

    await db.manager.delete({
      where: {
        id: managerId,
      },
    });
  }
}
