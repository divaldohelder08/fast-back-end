import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import type { decodedUserIdProps } from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";

export class RecolhaUseCase {
  async find({ client: clientName, driver: driverName }: {
    client: string;
    driver: string;
  }) {
    const startDate = dayjs().subtract(1, "M");
    return await db.recolha.findMany({
      where: {
        createdAt: {
          gte: startDate.startOf("day").toDate(),
        },
        client: {
          name: {
            contains: clientName,
          },
        },
        driver: {
          name: {
            contains: driverName,
          },
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
  async delete({ id }: decodedUserIdProps) {
    prisma.recolha.findError(id)
    await db.recolha.delete({
      where: {
        id,
      },
    });
  }
}
