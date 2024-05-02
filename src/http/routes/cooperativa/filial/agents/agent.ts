import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AgentUseCase } from "./agent-usecase";

export async function Agent(fastify: FastifyInstance) {
  const agentUseCase = new AgentUseCase();
  fastify.get("/", async (req, reply) => {
    const { filialId } = z
      .object({
        filialId: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(await agentUseCase.find(filialId));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.delete("/:id", async (req, reply) => {
    const { key } = z
      .object({
        key: z.string(),
      })
      .parse(req.query);
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    const user = req.super;
    if (!user) return reply.code(401).send({ message: "Token invalido" });
    try {
      await agentUseCase.delete({
        id: user.id,
        key,
        agentId: id,
      });
      return reply.code(200).send({ message: "Agente apagado com sucesso!" });
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
