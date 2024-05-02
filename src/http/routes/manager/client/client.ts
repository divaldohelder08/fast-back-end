import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ClientUseCase } from "./client-usecase";

export async function Client(fastify: FastifyInstance) {
  const clientUseCase = new ClientUseCase();
  fastify.get("/", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await clientUseCase.find(manager.filialId));
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
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      await clientUseCase.delete({
        filialId: manager.filialId,
        id: manager.id,
        key,
        clintId: id,
      });
      return reply
        .code(200)
        .send({ message: "Motorista deletado com sucesso" });
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/:id", async (req, reply) => {
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(
        await clientUseCase.findById({ id, filialId: manager.filialId })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/geo-map", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    const { numberBI } = z
      .object({
        numberBI: z.string(),
      })
      .parse(req.query);

    try {
      return reply.send(
        await clientUseCase.geoMap({
          filialId: manager.filialId,
          numberBI,
        })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
