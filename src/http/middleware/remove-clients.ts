import dayjs from "dayjs";
import { db } from "../../db/connection";

export async function paymentExpired() {
  const today = dayjs().toDate();
  await db.client.updateMany({
    data: {
      status: "npago",
    },
    where: {
      payment: {
        endAt: {
          lt: today,
        },
      },
    },
  });
}
