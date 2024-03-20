import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthManager } from "../../middleware/manager";
import { AgentUseCase } from "./agent-usecase";
import { Client } from "./client/client";
import { Recolha } from "./recolha/recolha";
import { Driver } from "./driver/driver";
import { Settings } from "./settings/settings";
import { Metrics } from "./metrics/metrics";
import { AgentMiddleware } from "../../middleware/agent";
// import { Agent } from "./agents/agent";

export const authenticateSchema = z.object({
  email: z.string().email({ message: "Formato de email inválido" }),
  password: z.string(),
});
export type authenticateData = z.infer<typeof authenticateSchema>;


export const makePayment=z.object({
  clientId:z.string(),
})


export async function Agent(fastify: FastifyInstance) {
  const agentUseCase = new AgentUseCase();
  fastify.addHook("preHandler", AgentMiddleware);
  fastify.get("/profile", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    try {
      const profile = await agentUseCase.profile({
        id: user.id,
        filialId: user.filialId,
      });
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar perfil" });
    }
  });
  fastify.post("/update-status", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    const { status } = filialStatuSchema.parse(req.body);
    try {
      const up = await agentUseCase.updateFilialStatus({
        filial: { status },
        id: user.id,
        filialId: user.filialId,
      });
      if (!up) {
        throw new Error("Erro ao atualizar status da filial");
      }
      return reply.code(200).send();
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao atualizar status da filial" });
    }
  });
  fastify.register(Client, {
    prefix: "/clients",
  });
  fastify.register(Agent, {
    prefix: "/agents",
  });
  fastify.register(Recolha, {
    prefix: "/recolhas",
  });
  fastify.register(Driver, {
    prefix: "/drivers",
  });
  fastify.register(Settings, {
    prefix: "/settings",
  });
  fastify.register(Metrics, {
    prefix: "/metrics",
  });
}
