import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthManager } from "../../middleware";
import { ManagerUseCase } from "./manager-usecase";

export const authenticateSchema = z.object({
  email: z.string().email({ message: "Formato de email inválido" }),
  filialId: z.string(),
  password: z.string(),
});
export type authenticateData = z.infer<typeof authenticateSchema>;

export const filialStatuSchema = z.object({
  status: z.enum(["aberta", "fechado"]),
});
export type filialStatusData = z.infer<typeof filialStatuSchema>;
export async function Manager(fastify: FastifyInstance) {
  const managerUseCase = new ManagerUseCase();
  fastify.addHook("preHandler", AuthManager);
  fastify.get("/recolhas", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    try {
      const recolhas = await managerUseCase.recolha({
        filialId: user.filialId,
        id: user.id,
      });
      return reply.send(recolhas);
    } catch (error) {
      console.error(error);
    }
  });
  fastify.get("/clients", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    try {
      const clients = await managerUseCase.clients({
        filialId: user.filialId,
        id: user.id,
      });
      return reply.send(clients);
    } catch (error) {
      console.error(error);
    }
  });
  fastify.get("/profile", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    try {
      const profile = await managerUseCase.profile({
        id: user.id,
        filialId: user.filialId,
      });
      return reply.send(profile);
    } catch (error) {
      console.error(error);
    }
  });
  fastify.post("/update-status", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    const { status } = filialStatuSchema.parse(req.body);
    try {
      const up = await managerUseCase.updateFilialStatus({
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
    }
  });
  fastify.get("/recolha/:id", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    const recolhaSchema = z.object({
      id: z.string(),
    });
    const { id } = recolhaSchema.parse(req.params);
    try {
      const recolha = await managerUseCase.recolhaById({
        recolhaId: id,
        filialId: user.filialId,
        id: user.id,
      });
      return reply.send(recolha);
    } catch (error) {
      console.error(error);
    }
  });
}
