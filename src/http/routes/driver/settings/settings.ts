import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { SettingsUseCase } from "./settings-usecase";

const updateKeySchema = z.object({
  antiga: z.string(),
  nova: z.string().min(6, "Min 6").max(15, "Max 15"),
});

const updateProfileSchema = z.object({
  name: z.string().min(10, "Min 10").max(255, "Max 255"),
  email: z.string().min(10, "Min 10").max(255, "Max 255"),
  avatar: z.string().nullable(),
});

const updateTelSchema = z.object({
  tel: z
    .string()
    .min(9, "Min 9")
    .max(9, "Max 9")
    .regex(/9[1-5][0-9]{7}/, "Número invalido"),
});

export const filialStatuSchema = z.object({
  status: z.enum(["aberta", "fechado"]),
});

export type filialStatusData = z.infer<typeof filialStatuSchema>;
export async function Settings(fastify: FastifyInstance) {
  const settingsUseCase = new SettingsUseCase();
  fastify.patch("/update-key", async (req, reply) => {
    const driver = req.driver;
    if (!driver) return reply.code(401).send({ message: "Token invalido" });
    const { antiga, nova } = updateKeySchema.parse(req.body);
    try {
      await settingsUseCase.updateKey({
        antiga,
        nova,
        id: driver.id,
      });
      return reply.code(204).send("Senha atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  //patch
  fastify.patch("/update-profile", async (req, reply) => {
    const driver = req.driver;
    if (!driver) return reply.code(401).send({ message: "Token invalido" });
    const { avatar, email, name } = updateProfileSchema.parse(req.body);
    try {
      await settingsUseCase.updateProfile({
        avatar,
        email,
        name,
        id: driver.id,
      });
      return reply.code(204).send("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao atualizar perfil!" });
    }
  });
  fastify.patch("/update-tel", async (req, reply) => {
    const driver = req.driver;
    if (!driver) return reply.code(401).send({ message: "Token invalido" });
    const { tel } = updateTelSchema.parse(req.body);
    try {
      await settingsUseCase.updateTel({
        tel,
        id: driver.id,
      });
      return reply.code(204).send("Telefone atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
