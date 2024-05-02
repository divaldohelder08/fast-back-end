import dayjs from "dayjs";
import { db } from "../../../../../db/connection";

interface findRecolhaProps {
  client: string;
  driver: string;
  filialId: string;
}

export class RecolhaUseCase {
  async find({
    client: clientName,
    driver: driverName,
    filialId,
  }: findRecolhaProps) {
    const startDate = dayjs().subtract(1, "M");
    return await db.recolha.findMany({
      where: {
        filialId,
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
        orderBy: {
          createdAt: "desc",
        },
    });
  }
  async delete(id: string) {
    if (
      !(await db.recolha.findUnique({
        where: {
          id,
        },
      }))
    ) {
      throw Error("Recolha não encontrada!");
    }

    await db.recolha.delete({
      where: {
        id,
      },
    });
  }
}
