import type { FilialStatus } from "@prisma/client";
import dayjs from "dayjs";
import type { z } from "zod";
import { db } from "../../../../db/connection";
import type { GroupedData } from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";
import type {
  filialStatusData,
  formFilialContactoSchema,
  formFilialSchema,
  formManagerSchema,
} from "./filial";
export class FilialUseCase {
  async getFilias({
    name: filialName,
    status: filialStatus,
  }: {
    name: string;
    status: string;
  }) {
    const today = dayjs();
    const weekAgo = today.subtract(1, "week").toDate();
    const filias = await db.filial.findMany({
      where:
        (filialStatus != "" ? filialStatus : null) === null
          ? {
            name: {
              contains: filialName,
            },
          }
          : {
            name: {
              contains: filialName,
            },
            status: filialStatus as FilialStatus,
          },
      select: {
        id: true,
        name: true,
        status: true,
        manager: {
          select: {
            name: true,
            avatar: true,
          },
        },
        address: true,
        _count: {
          select: {
            clients: true,
            drivers: true,
            recolhas: true,
          },
        },
      },
    });

    const promises = filias.map(async (f) => {
      const valor = await db.recolha.groupBy({
        by: ["createdAt"],
        where: {
          filialId: f.id,
          createdAt: { gt: weekAgo },
        },
        _count: true,
        orderBy: {
          createdAt: "desc",
        },
      });
      const groupedByMinute = valor.reduce((acc: GroupedData, e) => {
        const date = new Date(e.createdAt);
        date.setSeconds(0, 0);
        const dateKey = date.toISOString();
        if (!acc[dateKey]) {
          acc[dateKey] = {
            recolhas: 0,
            data: dateKey,
          };
        }
        acc[dateKey].recolhas += e._count;
        return acc;
      }, {});
      const chart = Object.values(groupedByMinute).map((e) => {
        return {
          recolhas: e.recolhas,
          data: new Date(e.data).toLocaleDateString("br", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      });
      const { _count, address, id, manager, name, status } = f;
      return {
        address,
        id,
        manager,
        name,
        status,
        chart,
        _count,
      };
    });

    return await Promise.all(promises);
  }
  async getAvailableManagers() {
    return await db.manager.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        filial: {
          every: {
            managerId: {
              equals: null,
            },
          },
        },
      },
    });
  }
  async updateFilialManager({
    id,
    managerId,
    filialId,
    key,
  }: {
    managerId: string | null;
    filialId: string;
    key: string;
    id: string;
  }) {
    if (
      !(await db.manager.findUnique({
        where: {
          id,
          password: key,
        },
      }))
    ) {
      throw Error("Chave do manager incorreta");
    }

    await db.filial.update({
      data: {
        managerId,
      },
      where: {
        id: filialId,
      },
    });
  }
  async getOverView(filialId: string) {
    return await db.filial.findFirstOrThrow({
      where: {
        id: filialId,
      },
      select: {
        name: true,
        tel: true,
        status: true,
        createdAt: true,
        email: true,
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
  async getManager(filialId: string) {
    const manager = await db.manager.findFirst({
      where: {
        filial: {
          some: {
            id: filialId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        tel: true,
        role: true,
        createdAt: true,
      },
    });
    if (!manager) return null;
    return manager;
  }
  async createManager({
    email,
    tel,
    ...rest
  }: z.infer<typeof formManagerSchema>) {
    await prisma.manager.telError(tel);
    await prisma.manager.emailError(email);
    await db.manager.create({
      data: { email, tel, ...rest },
    });
  }
  async create({ tel, email, ...rest }: z.infer<typeof formFilialSchema>) {
    await prisma.filial.telError(tel);
    await prisma.filial.emailError(email);
    await db.filial.create({
      data: {
        tel,
        email,
        ...rest,
      },
    });
  }
  async updateContacto({
    tel,
    email,
    id,
  }: z.infer<typeof formFilialContactoSchema>) {
    await prisma.filial.telError(tel);
    await prisma.filial.emailError(email);
    await db.filial.update({
      where: {
        id,
      },
      data: {
        tel,
        email,
      },
    });
  }
  async updateFilialStatus({ status, id }: filialStatusData) {
    if (status === "fechado") {
      await db.agents.updateMany({
        where: {
          filialId: id,
        },
        data: {
          status: "Off",
        },
      });
      await db.driver.updateMany({
        where: {
          filialId: id,
        },
        data: {
          status: "Off",
        },
      });
    }
    return await db.filial.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
  async geoMap(name: string) {
    return await db.filial.findMany({
      select: {
        id: true,
        name: true,
        address:true,
        manager: {
          select: {
            avatar: true,
            name: true
          }
        },
        coordenadas: true,
      },
      where: {
        name: {
          contains: name
        }
      },
    });
  }
}
