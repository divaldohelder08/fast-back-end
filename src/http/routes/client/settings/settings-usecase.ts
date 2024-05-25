import { db } from "../../../../db/connection";
import type { decodedUserIdProps, updateKeyProps } from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";

interface updateProfileType extends decodedUserIdProps {
  name: string;
  email: string;
  avatar?: string | null;
  tel: string;
}

export class SettingsUseCase {
  async updateKey({ antiga, id, nova }: updateKeyProps) {
    const client = await db.client.findUnique({
      where: {
        password: antiga,
        id,
      },
    });
    if (!client) {
      throw Error("Senha atual incorreta");
    }

    await db.client.update({
      where: {
        id: client.id,
      },
      data: {
        password: nova,
      },
    });
  }
  async updateProfile({ avatar, email, tel, id }: updateProfileType) {
    await prisma.client.find(id)
    await db.client.update({
      where: {
        id,
      },
      data: {
        avatar,
        email,
        tel
      },
    });
  }
}
