import type {
  decodedUserFilialIdProps,
  decodedUserIdProps,
  updateKeyProps,
} from "../../../../../index-types";
import { db } from "../../../../db/connection";
import type { filialStatusData } from "./settings";

interface updateProfileType extends decodedUserIdProps {
  name: string;
  email: string;
  avatar?: string | null;
}

interface updateTelProps extends decodedUserIdProps {
  tel: string;
}

interface filialStatusProps extends decodedUserFilialIdProps {
  status: "aberta" | "fechado";
}

export class SettingsUseCase {
  async getOverView({ filialId }: decodedUserFilialIdProps) {
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
  async updateFilialStatus({ status, filialId }: filialStatusProps) {
    return db.filial.update({
      where: {
        id: filialId,
      },
      data: {
        status,
      },
    });
  }
}
