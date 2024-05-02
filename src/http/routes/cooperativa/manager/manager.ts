import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ManagerUseCase } from "./manager-usecase";

export async function Manager(fastify: FastifyInstance) {
  const managerUseCase = new ManagerUseCase();
  fastify.get("/", async (req, reply) => {
    const user = req.super;
    if (!user) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await managerUseCase.find());
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
      await managerUseCase.delete({
        id: user.id,
        key,
        managerId: id,
      });
      return reply
        .code(200)
        .send({ message: "Gerente deletado com sucesso" });
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
