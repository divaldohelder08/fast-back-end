import { db } from "../../../../db/connection";
import type {
  decodedUserIdProps,
  filialId,
  updateKeyProps,
} from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";

interface updateProfileType extends decodedUserIdProps {
  name: string;
  email: string;
  avatar?: string | null;
}

interface updateTelProps extends decodedUserIdProps {
  tel: string;
}

interface filialStatusProps extends filialId {
  status: "aberta" | "fechado";
}

export class SettingsUseCase {
  async getOverView({ filialId }: filialId) {
    return await db.filial.findFirstOrThrow({
      where: {
        id: filialId,
      },
      select: {
        name: true,
        tel: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            clients: true,
            drivers: true,
            recolhas: true,
          },
        },
      },
    });
  }
  async updateKey({ antiga, id, nova }: updateKeyProps) {
    await prisma.manager.findError(id)
    const manager = await db.manager.findUnique({
      where: {
        password: antiga,
        id,
      },
    });
    if (!manager) throw Error("Senha atual incorreta");

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
    await prisma.manager.findError(id)
    await db.manager.update({
      where: {
        id,
      },
      data: {
        tel,
      },
    });
  }
  async updateFilialStatus({ status, filialId }: filialStatusProps) {
    if (status === "fechado") {
      await db.agents.updateMany({
        where: {
          filialId,
        },
        data: {
          status: "Off",
        },
      });
      await db.driver.updateMany({
        where: {
          filialId,
        },
        data: {
          status: "Off",
        },
      });
    }
    return await db.filial.update({
      where: {
        id: filialId,
      },
      data: {
        status,
      },
    });
  }
}
