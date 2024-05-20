import { db } from "../../../db/connection";
import { encrypt } from "../../../lib/jose";
import type { driverAuthData } from "./driver";

export class DriverUseCase {
  async profile(id: string) {
    return db.driver.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        createdAt: true,
        tel: true,
      },
    });
  }
  async authenticate({ email, password }: driverAuthData) {
    const user = await db.driver.findFirst({
      where: {
        email,
        password,
        status: "On",
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        filial: {
          select: {
            id: true,
          },
        },
      },
    });


    if (!user || !user.filial) {
      throw new Error("Credenciais inválidas");
    }

    const token = await encrypt({
      id: user.id,
      filialId: user.filial.id,
    });

    return {
      user,
      token,
    };
  }
}
