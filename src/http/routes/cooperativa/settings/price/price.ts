import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PriceUseCase } from "./prece-usecase";

export async function Price(fastify: FastifyInstance) {
  const priceUseCase=new PriceUseCase()
  fastify.get("/", async (req, reply) => {
    try {
      return reply.send(await priceUseCase.getPrice());
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/new", async (req, reply) => {
    const manager = req.super;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    const { key, price } = z
      .object({
        key: z
          .string({
            required_error: "A senha é obrigatória",
          })
          .min(4, "Min 4"),
        price: z.coerce
          .number({
            required_error: "O preço é obrigatório",
          })
          .min(2000, "Min 2.000,00 kz"),
      })
      .parse(req.body);
    try {
      await priceUseCase.updatePrice({
        managerId: manager.id,
        password: key,
        price,
      });
      return reply.code(204).send("Preço atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
