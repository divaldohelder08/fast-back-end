import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { settingsUseCase } from "./settings-usecase";


const formUpdateKeySchema = z
  .object({
    antiga: z.string().min(2, "Mím 2"),
    nova: z.string().min(6, "Mím 6").max(15, "Máx"),
  })
  .refine((data) => data.antiga !== data.nova, {
    message: "A nova senha ñ pode ser igual a antiga",
    path: ["nova"],
  });
export type formUpdateKeySchemaData = z.infer<typeof formUpdateKeySchema>;

const formEditProfileSchema = z.object({
  name: z.string().max(250, "Max 250"),
  email: z
    .string()
    .email("Formato invalido")
    .min(15, "Min 15")
    .max(250, "Max 250"),
  avatar: z.string().nullable(),
  tel: z
    .string()
    .trim()
    .max(9, "Max 9")
    .min(9, "Min 9")
    .regex(new RegExp(/9[1-5][0-9]{7}/), "Formato invalido"),
});
export type formEditProfileData = z.infer<typeof formEditProfileSchema>;

export async function Settings(fastify: FastifyInstance) {
  fastify.get("/get-over-view", async (req, reply) => {
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });
    try {
      const overView = await settingsUseCase.getOverView(agent.id);
      return reply.send(overView);
    } catch (error) {
      console.error(error);
      reply
        .code(500)
        .send({ message: "Erro ao buscar visão geral da filial!" });
    }
  });
  fastify.patch("/update-profile", async (req, reply) => {
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });
    const { avatar, email, name, tel } = formEditProfileSchema.parse(req.body);
    try {
      await settingsUseCase.updateProfile({
        avatar,
        email,
        name,
        tel,
        id: agent.id,
      });
      return reply.code(204).send("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.patch("/update-key", async (req, reply) => {
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });
    const { ...rest } = formUpdateKeySchema.parse(req.body);
    try {
      await settingsUseCase.updateKey({
        id: agent.id,
        ...rest,
      });
      return reply.code(204).send("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao atualizar perfil!" });
    }
  });
}
