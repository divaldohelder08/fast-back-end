import { db } from "@/db/connection";
import dayjs from "dayjs";
import Elysia, { t } from "elysia";

export const getDailyReceiptInPeriod = new Elysia().get(
  "/daily-receipt-in-period",
  async ({ query, set }) => {
    const { from, to } = query;

    const startDate = from ? dayjs(from) : dayjs().subtract(7, "d");
    const endDate = to ? dayjs(to) : from ? startDate.add(7, "days") : dayjs();

    if (endDate.diff(startDate, "days") > 7) {
      set.status = 400;

      return {
        code: "INVALID_PERIOD",
        message: "O intervalo das datas não pode ser superior a 7 dias.",
      };
    }

    const receiptPerDay = await db.recolha.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: startDate.startOf("day").toDate(),
          lte: endDate.endOf("day").toDate(),
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return receiptPerDay.sort((a, b) => {
      const first = {
        day: a.createdAt.getDate(),
        month: a.createdAt.getMonth(),
      };
      const second = {
        day: b.createdAt.getDate(),
        month: b.createdAt.getMonth(),
      };

      if (first.month === second.month) {
        return first.day - second.day;
      }

      return (
        new Date(2024, first.month - 1).getTime() -
        new Date(2024, second.month - 1).getTime()
      );
    });
  },
  {
    query: t.Object({
      from: t.Optional(t.String()),
      to: t.Optional(t.String()),
    }),
  },
);
