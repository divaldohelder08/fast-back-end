import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AgentMiddleware } from "../../middleware/agent";
import { agentUseCase } from "./agent-usecase";
import { Client } from "./client/client";
import { Settings } from "./settings/settings";

export const authenticateSchema = z.object({
  email: z.string().email({ message: "Formato de email inválido" }),
  filialId: z.string(),
});
export type authenticateData = z.infer<typeof authenticateSchema>;

export const makePayment = z.object({
  clientId: z.string(),
});

export async function Agent(fastify: FastifyInstance) {
  fastify.addHook("preHandler", AgentMiddleware);
  fastify.get("/profile", async (req, reply) => {
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });
    try {
      const profile = await agentUseCase.profile(agent.id);
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.get("/price", async (req, reply) => {
    try {
      const profile = await agentUseCase.getPrice();
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });

  fastify.register(Client, {
    prefix: "/clients",
  });
  fastify.register(Settings, {
    prefix: "/settings",
  });
}
