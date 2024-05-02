import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { RecolhaUseCase } from "./recolha-usecase";

export async function Recolha(fastify: FastifyInstance) {
  const recolhaUseCase = new RecolhaUseCase();
  fastify.get("/", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    const { client, driver } = z
      .object({
        client: z.string(),
        driver: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(
        await recolhaUseCase.find({
          filialId: manager.filialId,
          client,
          driver,
        })
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar recolhas" });
    }
  });
  fastify.get("/:id", async (req, reply) => {
    console.log("aqui");
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    console.log(id);
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(
        await recolhaUseCase.findById({
          recolhaId: id,
        })
      );
    } catch (error) {
      reply.code(500).send(error);
    }
  });
  fastify.delete("/:id", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    console.log("deletando");
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    try {
      await recolhaUseCase.delete({
        filialId: manager.filialId,
        id: manager.id,
        recolhaId: id,
      });
      return reply.code(200).send("Recolha deletada com sucesso");
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
