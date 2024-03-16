import { db } from "../../../db/connection";
import dayjs from "dayjs";
import type { authenticateData, filialStatusData } from "./manager";
import { encrypt } from "../../../lib/jose";

interface decodedUserProps {
  id: string;
  filialId: string;
}

interface filialStatusProps extends decodedUserProps {
  filial: filialStatusData;
}
interface recolhaByIdProps extends decodedUserProps {
  recolhaId: string;
}

export class ManagerUseCase {
  async recolha({ filialId }: decodedUserProps) {
    const startDate = dayjs().subtract(1, "M");
    return await db.recolha.findMany({
      where: {
        filialId,
        createdAt: {
          gte: startDate.startOf("day").toDate(),
        },
      },
      select: {
        id: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        status: true,
        createdAt: true,
      },
    });
  }
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
    });
  }
  async profile({ id }: decodedUserProps) {
    return db.manager.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        filial: {
          select: {
            name: true,
          },
        },
      },
    });
  }
  async updateFilialStatus({
    filial: { status },
    filialId,
  }: filialStatusProps) {
    return db.filial.update({
      where: {
        id: filialId,
      },
      data: {
        status,
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
              role: "gerente",
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
    console.log(user);
    if (!user || !user.manager) {
      console.log("erro");

      throw new Error("Credenciais inválidas");
    }
    const userInfo = {
      id: user.manager.id,
      name: user.manager.name,
      email: user.manager.email,
      avatar: user.manager.avatar,
      role: "manager",
      filial: {
        id: user.id,
        name: user.name,
      },
    };

    const token = await encrypt({
      id: userInfo.id,
      filialId: userInfo.filial.id,
    });
    console.log({
      user: userInfo,
      token,
    });
    return {
      user: userInfo,
      token,
    };
  }
  async recolhaById({ recolhaId, filialId }: recolhaByIdProps) {
    return await db.recolha.findFirstOrThrow({
      where: {
        id: recolhaId,
        filialId: {
          equals: filialId,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        duration: true,
        distance: true,
        client: {
          select: {
            name: true,
            tel: true,
            email: true,
          },
        },
        driver: {
          select: {
            name: true,
            veiculo: {
              select: {
                matricula: true,
              },
            },
          },
        },
        filial: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
