import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { RecolhaUseCase } from "./recolha-usecase";

export async function Recolha(fastify: FastifyInstance) {
  const recolhaUseCase = new RecolhaUseCase();
  fastify.post("/", async (req, reply) => {
    const client = req.client;
    if (!client) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await recolhaUseCase.create({
        clientId: client.id,
        filialId: client.filialId
      }));
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  })
  fastify.get("/:id", async (req, reply) => {
    const client = req.client;
    if (!client) return reply.code(401).send({ message: "Token invalido" });
    const { id } = z.object({
      id: z.string({ required_error: "O id da recolha é obrigatorio" }).min(2, "Min 2")
    }).parse(req.params)
    try {
      return reply.send(await recolhaUseCase.findById(id));
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  })
  fastify.patch("/:id", async (req, reply) => {
    const client = req.client;
    if (!client) return reply.code(401).send({ message: "Token invalido" });
    const { id } = z.object({
      id: z.string({ required_error: "O id da recolha é obrigatorio" }).min(2, "Min 2")
    }).parse(req.params)
    try {
      return reply.send(await recolhaUseCase.handleCancel(id));
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  })
  
  fastify.get("/finalizadas", async (req, reply) => {
    const client = req.client;
    if (!client) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await recolhaUseCase.delivered(client.id));
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.get("/andamento", async (req, reply) => {
    const client = req.client;
    if (!client) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await recolhaUseCase.inAndamento(client.id));
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
}
