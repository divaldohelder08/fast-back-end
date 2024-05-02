import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { RecolhaUseCase } from "./recolha-usecase";

export async function Recolha(fastify: FastifyInstance) {
  const recolhaUseCase = new RecolhaUseCase();
  fastify.get("/", async (req, reply) => {
    const { client, driver, filialId } = z
      .object({
        client: z.string(),
        driver: z.string(),
        filialId: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(
        await recolhaUseCase.find({
          client,
          driver,
          filialId,
        })
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar recolhas" });
    }
  });
}
