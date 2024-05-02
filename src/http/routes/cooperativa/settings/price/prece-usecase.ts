import { db } from "../../../../../db/connection";
import { LastPayment } from "../../../../../utils/last-payment";
import { prisma } from "../../../../../utils/prisma-throws";

export class PriceUseCase {
  async getPrice() {
    const payment = await LastPayment();
    if (!payment) throw new Error("Preço não encontrado");
    return payment;
  }
  async updatePrice({
    password,
    price,
    managerId,
  }: {
    password: string;
    price: number;
    managerId: string;
  }) {
    await prisma.manager.autorize({id:managerId, password})

    await db.price.create({
      data: {
        price,
        managerId,
      },
    });
  }
}
