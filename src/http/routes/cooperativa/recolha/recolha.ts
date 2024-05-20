import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { RecolhaUseCase } from "./recolha-usecase";

export async function Recolha(fastify: FastifyInstance) {
  const recolhaUseCase = new RecolhaUseCase();
  fastify.get("/", async (req, reply) => {
    const { client, driver } = z
      .object({
        client: z.string(),
        driver: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(
        await recolhaUseCase.find({
          client,
          driver,
        })
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar recolhas" });
    }
  });
  fastify.delete("/:id", async (req, reply) => {
    const user = req.super;
    if (!user) return reply.code(401).send({ message: "Token invalido" });
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    try {
      await recolhaUseCase.delete({
        id,
      });
      return reply.code(200).send("Recolha deletada com sucesso");
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
