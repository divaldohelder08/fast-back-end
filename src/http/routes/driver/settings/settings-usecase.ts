import { db } from "../../../../db/connection";
import type { decodedUserIdProps, updateKeyProps } from "../../../../types";

interface updateProfileType extends decodedUserIdProps {
  name: string;
  email: string;
  avatar?: string | null;
}

interface updateTelProps extends decodedUserIdProps {
  tel: string;
}

export class SettingsUseCase {
  async updateKey({ antiga, id, nova }: updateKeyProps) {
    const driver = await db.driver.findUnique({
      where: {
        password: antiga,
        id,
      },
    });
    if (!driver) throw Error("Senha atual incorreta");

    await db.driver.update({
      where: {
        id: driver.id,
      },
      data: {
        password: nova,
      },
    });
  }
  async updateProfile({ avatar, email, name, id }: updateProfileType) {
    await db.driver.update({
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
    await db.driver.update({
      where: {
        id,
      },
      data: {
        tel,
      },
    });
  }
}
