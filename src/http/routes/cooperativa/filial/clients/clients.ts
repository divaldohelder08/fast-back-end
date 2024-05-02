import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ClientUseCase } from "../../../manager/client/client-usecase";

export async function Clients(fastify: FastifyInstance) {
  const clientUseCase = new ClientUseCase();
  fastify.get("/", async (req, reply) => {
    const { filialId } = z
      .object({
        filialId: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(await clientUseCase.find(filialId));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
