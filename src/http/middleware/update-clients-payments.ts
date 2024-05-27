import dayjs from "dayjs";
import { db } from "../../db/connection";

export async function paymentExpired() {
  const today = dayjs().startOf("hours").set("hour", 1).toDate()
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
  console.log("payments revisados.");
}
