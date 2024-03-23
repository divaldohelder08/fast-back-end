import type { FastifyInstance } from "fastify";
import { SettingsUseCase } from "./settings-usecase";
import { z } from "zod";
import { pdf } from "./pdf/pdf";

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
  fastify.get("/get-over-view", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    try {
      const overView = await settingsUseCase.getOverView({
        filialId: user.filialId,
      });
      return reply.send(overView);
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/update-key", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    const { antiga, nova } = updateKeySchema.parse(req.body);
    try {
      await settingsUseCase.updateKey({
        antiga,
        nova,
        id: user.id,
      });
      return reply.code(204).send("Senha atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.patch("/update-profile", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    const { avatar, email, name } = updateProfileSchema.parse(req.body);
    try {
      await settingsUseCase.updateProfile({
        avatar,
        email,
        name,
        id: user.id,
      });
      return reply.code(204).send("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao atualizar perfil!" });
    }
  });
  fastify.patch("/update-tel", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    const { tel } = updateTelSchema.parse(req.body);
    try {
      await settingsUseCase.updateTel({
        tel,
        id: user.id,
      });
      return reply.code(204).send("Telefone atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/update-status", async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ message: "Token invalid" });
    const { status } = filialStatuSchema.parse(req.body);
    try {
      const up = await settingsUseCase.updateFilialStatus({
        status,
        filialId: user.filialId,
      });
      if (!up) {
        throw new Error("Erro ao atualizar status da filial");
      }
      return reply.code(200).send();
    } catch (error) {
      console.error(error);
      reply.send(error)
    }
  });
  fastify.register(pdf, {
    prefix:"/pdf"
  })
}
