import { db } from "../../../../db/connection";
import type { formEditProfileData } from "./settings";

interface updateProfile extends formEditProfileData {
  id: string;
}
class SettingsUseCase {
  async getOverView(id: string) {
    return await db.agents.findFirstOrThrow({
      where: {
        id,
      },
      select: {
        name: true,
        tel: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });
  }
  async updateKey({
    antiga,
    id,
    nova,
  }: {
    id: string;
    antiga: string;
    nova: string;
  }) {
    const agent = await db.agents.findUnique({
      where: {
        password: antiga,
        id,
      },
    });
    if (!agent) {
      throw Error("Senha atual incorreta");
    }

    await db.agents.update({
      where: {
        id,
      },
      data: {
        password: nova,
      },
    });
  }
  async updateProfile({ avatar, email, name, id, tel }: updateProfile) {
    await db.agents.update({
      where: {
        id,
      },
      data: {
        tel,
        avatar,
        email,
        name,
      },
    });
  }
}

export const settingsUseCase = new SettingsUseCase();
