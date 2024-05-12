import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ClientMiddleware } from "../../middleware/client";
import { ClientUseCase } from "./client-usecase";
import { Recolha } from "./recolha/recolha";
import { Settings } from "./settings/settings";

export const ClientAuthSchema = z.object({
  email: z.string().email({ message: "Formato de email inválido" }),
  password: z.string(),
});
export type clientAuthData = z.infer<typeof ClientAuthSchema>;

export default async function Client(fastify: FastifyInstance) {
  const clientUseCase = new ClientUseCase();
  fastify.addHook("preHandler", ClientMiddleware);
  fastify.get("/profile", async (req, reply) => {
    const client = req.client;
    if (!client) return reply.code(401).send({ message: "Token invalido" });
    try {
      const profile = await clientUseCase.profile(client.id);
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar perfil" });
    }
  });
  fastify.get("/dashboard", async (req, reply) => {
    const client = req.client;
    if (!client) return reply.code(401).send({ message: "Token invalido" });
    try {
      const profile = await clientUseCase.dashboard(client.id);
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.register(Recolha, {
    prefix: "/recolhas",
  });
  fastify.register(Settings, {
    prefix: "/settings",
  });
}
