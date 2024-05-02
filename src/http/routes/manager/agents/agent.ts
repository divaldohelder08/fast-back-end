import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { updateStatuSchema } from "../driver/driver";
import { agentUseCase } from "./agent-usecase";
const agentSchema = z.object({
  name: z.string().min(10, "Min 10").max(255, "Max 255"),
  email: z.string().email("Formato invalido"),
  sexo: z.enum(["M", "F"]),
  tel: z
    .string()
    .min(9, "Min 9")
    .max(9, "Max 9")
    .regex(/9[1-5][0-9]{7}/, "Número invalido"),
});
export type agentProps = z.infer<typeof agentSchema>;

export async function Agent(fastify: FastifyInstance) {
  fastify.get("/", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await agentUseCase.find(manager.filialId));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar Agente" });
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
      return reply
        .code(200)
        .send(
          await agentUseCase.findById({ filialId: manager.filialId, id: id })
        );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.delete("/:id", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    const { id } = z
      .object({
        id: z.string({ required_error: "O id é obrigatório" }),
      })
      .parse(req.params);

    try {
      await agentUseCase.delete({
        filialId: manager.filialId,
        id,
      });
      return reply.code(200).send({ message: "Agente deletado com sucesso" });
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.post("/create", async (req, reply) => {
    const { email, name, sexo, tel } = agentSchema.parse(req.body);
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      await agentUseCase.create({
        filialId: manager.filialId,
        email,
        name,
        sexo,
        tel,
      });
      return reply.code(200).send({ message: "Agente criado com sucesso!" });
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/:id/update-status", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    const { status } = updateStatuSchema.parse(req.body);
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    try {
      await agentUseCase.updateStatus({
        filialId: manager.filialId,
        status,
        id,
      });
      return reply.code(200).send({ message: "Status atualizado com sucesso" });
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
