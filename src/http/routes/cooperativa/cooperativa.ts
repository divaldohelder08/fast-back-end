import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Client } from "./client/client";
import { Recolha } from "./recolha/recolha";
import { Settings } from "./settings/settings";
import { AuthCooperativa } from "../../middleware/cooperativa";
import { Agent } from "./agents/agent";
import { Manager } from "./manager/manager";
import { CooperativaUseCase } from "./cooperativa-usecase";
import { Filias } from "./filial/filial";
import { Metrics } from "./metrics/metrics";
import Driver from "./driver/driver";

export const authenticateSchema = z.object({
  email: z.string().email({ message: "Formato de email inválido" }),
  password: z.string(),
});
export type authenticateData = z.infer<typeof authenticateSchema>;

export async function Cooperativa(fastify: FastifyInstance) {
  const cooperativaUseCase = new CooperativaUseCase();
  fastify.addHook("preHandler", AuthCooperativa);
    fastify.get("/user", async (req, reply) => {
    const manager = req.super;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      const profile = await cooperativaUseCase.user(manager.id);
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.get("/profile", async (req, reply) => {
    const manager = req.super;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      const profile = await cooperativaUseCase.profile({
        id: manager.id,
      });
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.register(Manager, {
    prefix: "/managers",
  });
  fastify.register(Client, {
    prefix: "/clients",
  });
  fastify.register(Recolha, {
    prefix: "/recolhas",
  });
  fastify.register(Driver, {
    prefix: "/drivers",
  });
  fastify.register(Filias, {
    prefix: "/filias",
  });
  fastify.register(Settings, {
    prefix: "/settings",
  });
  fastify.register(Metrics, {
    prefix: "/metrics",
  });
  fastify.register(Agent, {
    prefix: "/agents",
  });
}
