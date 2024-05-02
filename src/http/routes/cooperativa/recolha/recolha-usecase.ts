import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import type { decodedUserIdProps } from "../../../../types";
interface findRecolhaProps {
  client: string;
  driver: string;
}

export class RecolhaUseCase {
  async find({ client: clientName, driver: driverName }: findRecolhaProps) {
    const startDate = dayjs().subtract(1, "M");
    const old = await db.recolha.findMany({
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
    console.log(old);
    return old;
  }
  async delete({ id }: decodedUserIdProps) {
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
