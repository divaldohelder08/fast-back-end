import dayjs from "dayjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ClientUseCase } from "./client-usecase";

const formDataSchema = z.object({
  name: z.string().min(15, "Min 15").max(250, "Max 250"),
  email: z
    .string()
    .email("Formato invalido")
    .min(15, "Min 15")
    .max(250, "Max 250"),
  numberBI: z
    .string()
    .min(14, "Min 14")
    .max(14, "Max 14")
    .regex(
      new RegExp(/[^a-zA-Z]{9}[^a-z0-9]{2}[^a-zA-Z]{3}/),
      "Formato invalido"
    ),
  sexo: z.enum(["F", "M"], {
    required_error: "O Sexo é obrigatório",
  }),
  avatar: z.string(),
  tel: z
    .string()
    .trim()
    .max(9, "Max 9")
    .min(9, "Min 9")
    .regex(new RegExp(/9[1-5][0-9]{7}/), "Formato invalido"),
  nascimento: z.coerce
    .date()
    .max(dayjs().subtract(20, "years").toDate(), "Muito Jovem, min 20 anos"),
  address: z.string().min(4, "Min 4"),
  coordenadas: z.number().array().min(2, "Min 2").max(2, "Max 2"),
});
export type formData = z.infer<typeof formDataSchema>;

const formEditDataSchema = z.object({
  address: z.string().min(10, "Min 10"),
  coordenadas: z
    .number({ required_error: "As coordenadas da casa são obrigatório" })
    .array()
    .min(2, "Min 2")
    .max(2, "Max 2"),
});
export type formEditData = z.infer<typeof formEditDataSchema>;

export async function Client(fastify: FastifyInstance) {
  const clientUseCase = new ClientUseCase();
  fastify.post("/", async (req, reply) => {
    const { ...rest } = formDataSchema.parse(req.body);
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });
    const data = {
      ...rest,
      agentId: agent.id,
      filialId: agent.filialId,
    };
    try {
      return reply.send(await clientUseCase.create(data));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/", async (req, reply) => {
    const { numberBI } = z
      .object({
        numberBI: z.string(),
      })
      .parse(req.query);

    try {
      return reply.send(
        await clientUseCase.findByBI(
          numberBI
        )
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/:id", async (req, reply) => {
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    try {
      return reply.send(await clientUseCase.findById(id));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/:id/pay", async (req, reply) => {
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    const { key } = z
      .object({
        key: z.string(),
      })
      .parse(req.body);
    try {
      return reply.send(
        await clientUseCase.pay({ id, agentId: agent.id, key })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/:id", async (req, reply) => {
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });

    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    const { address, coordenadas } = formEditDataSchema.parse(req.params);

    try {
      return reply.send(
        await clientUseCase.edit({
          address,
          coordenadas,
          agentId: agent.id,
          id,
        })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
