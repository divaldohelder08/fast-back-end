import dayjs from "dayjs";
import { db } from "../../../../db/connection";
import type { GroupedData, filialId } from "../../../../types";
class MetricsUseCase {
  async popularDrivers( filialId: string) {
    const drivers = await db.driver.findMany({
      where: {
        filialId,
      },
      select: {
        _count: {
          select: {
            recolhas: {
              where: {
                status: "finalizada",
              },
            },
          },
        },
        name: true,
      },
      take: 6,
    });
    return drivers
      .map((e) => {
        return { name: e.name, value: e._count.recolhas };
      })
      .sort((a, b) => {
        return b.value - a.value;
      });
  }
  async bigChart( filialId: string) {
    const today = dayjs();
    const weekAgo = today.subtract(1, "week").toDate();
    const valor = await db.recolha.groupBy({
      by: ["createdAt"],
      where: {
        filialId,
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

    return Object.values(groupedByMinute).map((e) => {
      return {
        recolhas: e.recolhas,
        data: new Date(e.data).toLocaleDateString("AOA", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  }
  async dayRecolhasAmount( filialId: string) {
    const today = dayjs();
    const yesterday = today.subtract(1, "day");
    const ordersPerDay = await db.recolha.groupBy({
      by: ["createdAt"],
      where: {
        filialId,
        createdAt: {
          gte: yesterday.toDate(),
        },
      },
      _count: true,
    });

    // filtrar todas as recolhas e concatenar a quantidade do dia de hoje
    const todayOrdersAmount = ordersPerDay
      .filter((orderInDay) => dayjs(orderInDay.createdAt).isSame(today, "day"))
      .reduce((total, order) => total + order._count, 0);

    // filtrar todas as recolhas e concatenar a quantidade do dia de ontem
    const yesterdayOrdersAmount = ordersPerDay
      .filter((orderInDay) =>
        dayjs(orderInDay.createdAt).isSame(yesterday, "day")
      )
      .reduce((total, order) => total + order._count, 0);

    // a diferença das recolhas do dia de hoje com as de ontem se o houver recolha nos dias
    const diffFromYesterday =
      yesterdayOrdersAmount && todayOrdersAmount
        ? (todayOrdersAmount * 100) / yesterdayOrdersAmount
        : null;

    return {
      amount: todayOrdersAmount ?? 0,
      diffFromYesterday: diffFromYesterday
        ? Number((diffFromYesterday - 100).toFixed(2))
        : 0,
    };
  }
  async monthCanceledRecolhasAmount( filialId: string) {
    const today = dayjs();
    const lastMonth = today.subtract(1, "month");
    const startOfLastMonth = lastMonth.startOf("month").toDate();

    const cancelledRecolhasPerMonth = await db.recolha.groupBy({
      by: ["createdAt"],
      where: {
        filialId,
        createdAt: { gte: startOfLastMonth },
        status: "cancelada",
      },
      _count: {
        _all: true,
      },
    });

    const currentMonthCancelledRecolhaAmount = cancelledRecolhasPerMonth
      .filter((recolhasInMonth) =>
        dayjs(recolhasInMonth.createdAt).isSame(today, "month")
      )
      .reduce(
        (total, recolhasInMonth) => total + recolhasInMonth._count._all,
        0
      );

    const lastMonthCancelledRecolhasAmount = cancelledRecolhasPerMonth
      .filter((recolhasInMonth) =>
        dayjs(recolhasInMonth.createdAt).isSame(lastMonth, "month")
      )
      .reduce(
        (total, recolhasInMonth) => total + recolhasInMonth._count._all,
        0
      );

    const diffFromLastMonthCancelled =
      lastMonthCancelledRecolhasAmount && currentMonthCancelledRecolhaAmount
        ? (currentMonthCancelledRecolhaAmount * 100) /
          lastMonthCancelledRecolhasAmount
        : null;

    return {
      amount: currentMonthCancelledRecolhaAmount ?? 0,
      diffFromLastMonthCancelled: diffFromLastMonthCancelled
        ? Number((diffFromLastMonthCancelled - 100).toFixed(2))
        : 0,
    };
  }
  async mothAmount( filialId: string) {
    const today = dayjs();
    const lastMonth = today.subtract(1, "month");
    const startOfLastMonth = lastMonth.startOf("month").toDate();

    const recolhasPerMonth = await db.recolha.groupBy({
      by: ["filialId", "createdAt"],
      where: {
        filialId,
        createdAt: { gte: startOfLastMonth },
      },
      _count: {
        _all: true,
      },
    });

    const currentMonthRecolhaAmount = recolhasPerMonth
      .filter((recolhasInMonth) =>
        dayjs(recolhasInMonth.createdAt).isSame(today, "month")
      )
      .reduce(
        (total, recolhasInMonth) => total + recolhasInMonth._count._all,
        0
      );

    const lastMonthRecolhasAmount = recolhasPerMonth
      .filter((recolhasInMonth) =>
        dayjs(recolhasInMonth.createdAt).isSame(lastMonth, "month")
      )
      .reduce(
        (total, recolhasInMonth) => total + recolhasInMonth._count._all,
        0
      );

    const diffFromLastMonth =
      lastMonthRecolhasAmount && currentMonthRecolhaAmount
        ? (currentMonthRecolhaAmount * 100) / lastMonthRecolhasAmount
        : null;
 
    return {
      amount: currentMonthRecolhaAmount ?? 0,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    };
  }
  async paymentAmount( filialId: string) {
    const today = dayjs();
    const lastMonth = today.subtract(1, "month");
    const startOfLastMonth = lastMonth.startOf("month").toDate();
    const payments = await db.payment.findMany({
      where: {
        createdAt: { gte: startOfLastMonth },
        Client: {
          some: {
            status: "pago",
            filialId,
          },
        },
      },
      select: {
        updateAt: true,
        price: true,
      },
    });
    const currentMonthPaymentAmount = payments
      .filter(
        (payment) =>
          dayjs(payment.updateAt).year() === today.year() &&
          dayjs(payment.updateAt).month() === today.month()
      )
      .reduce((total, payment) => total + payment.price.price, 0);

    const lastMonthPaymentAmount = payments
      .filter(
        (payment) =>
          dayjs(payment.updateAt).year() === lastMonth.year() &&
          dayjs(payment.updateAt).month() === lastMonth.month()
      )
      .reduce((total, payment) => total + payment.price.price, 0);

    const diffFromLastMonth =
      lastMonthPaymentAmount && currentMonthPaymentAmount
        ? (currentMonthPaymentAmount * 100) / lastMonthPaymentAmount
        : null;

    return {
      amount: currentMonthPaymentAmount ?? 0,

      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    };
  }
}

export const metricsUseCase= new MetricsUseCase()