import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { smSUseCase } from "./sms.usecase";
const SmsSchema = z.object({
  target: z.enum(["drivers", "clients", "agents", "managers"]),
  message: z.string({ required_error: "O conteudo da mensagem é obrigatório" }).min(1, "Min 1").max(500, "Max 500")
});

export type SmsProps = z.infer<typeof SmsSchema>;

export async function Sms(fastify: FastifyInstance) {
  fastify.post("/", async (request, reply) => {
    const { target, message } = SmsSchema.parse(request.body);
    smSUseCase.send({ target, message });
    reply.send({ message: "Mensagem enviada com sucesso" });
  });
}