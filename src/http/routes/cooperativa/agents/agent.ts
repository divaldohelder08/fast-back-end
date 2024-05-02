import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AgentUseCase } from "./agent-usecase";
const agentSchema = z.object({
  name: z.string().min(10, "Min 10").max(255, "Max 255"),
  email: z.string().email("Formato invalidoo"),
  sexo: z.enum(["M", "F"]),
  tel: z
    .string()
    .min(9, "Min 9")
    .max(9, "Max 9")
    .regex(/9[1-5][0-9]{7}/, "Número invalidoo"),
});
export type agentProps = z.infer<typeof agentSchema>;

export async function Agent(fastify: FastifyInstance) {
  const agentUseCase = new AgentUseCase();
  fastify.get("/", async (req, reply) => {
    try {
      return reply.send(await agentUseCase.find());
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.get("/:id", async (req, reply) => {
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    try {
      return reply.code(200).send(await agentUseCase.findById(id));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
