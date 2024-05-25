import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthManager } from "../../middleware/manager";
import { Agent } from "./agents/agent";
import { Client } from "./client/client";
import { Driver } from "./driver/driver";
import { managerUseCase } from "./manager-usecase";
import { Metrics } from "./metrics/metrics";
import { Pdf } from "./pdf/pdf";
import { Recolha } from "./recolha/recolha";
import { Settings } from "./settings/settings";

export const authenticateSchema = z.object({
  email: z.string().email({ message: "Formato de email inválido" }),
  filialId: z.string(),
  password: z.string(),
});
export type authenticateData = z.infer<typeof authenticateSchema>;

export async function Manager(fastify: FastifyInstance) {
  fastify.addHook("preHandler", AuthManager);
  fastify.get("/sign-out", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await managerUseCase.signOut(manager.filialId));
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.get("/profile", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      const profile = await managerUseCase.profile({
        id: manager.id,
        filialId: manager.filialId,
      });
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.register(Pdf, {
    prefix: "/pdf",
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
