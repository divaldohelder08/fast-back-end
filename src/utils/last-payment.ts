import { db } from "../db/connection";

export async function LastPayment() {
  const price = await db.price.findMany({
    select: {
      id: true,
      manager: {
        select: {
          name: true,
        },
      },
      price: true,
      updateAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return price[0];
}

