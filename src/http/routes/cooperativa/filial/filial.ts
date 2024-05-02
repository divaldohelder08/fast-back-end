import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Recolha } from "./recolha/recolha";
import { Agent } from "./agents/agent";
import { Clients } from "./clients/clients";
import Driver from "./driver/driver";
import { FilialUseCase } from "./filial-usecase";

export const formManagerSchema = z.object({
  name: z.string().trim().max(255, "Max 255").min(10, "Min 10"),
  email: z
    .string()
    .email("Formato invalido")
    .min(15, "Min 15")
    .max(255, "Max 255"),
  avatar: z.string().nullable(),
  tel: z
    .string()
    .trim()
    .max(9, "Max 9")
    .min(9, "Min 9")
    .regex(new RegExp(/9[1-5][0-9]{7}/), "Formato invalido"),
  sexo: z.enum(["F", "M"], {
    required_error: "O Sexo é obrigatório",
  }),
  role: z.enum(["gerente", "superGerente"], {
    required_error: "O role é obrigatório",
  }),
});

export const formFilialSchema = z.object({
  name: z.string().trim().max(100, "Max 100").min(10, "Min 10"),
  email: z
    .string()
    .email("Formato invalido")
    .min(15, "Min 15")
    .max(255, "Max 255"),
  tel: z
    .string()
    .trim()
    .max(9, "Max 9")
    .min(9, "Min 9")
    .regex(new RegExp(/9[1-5][0-9]{7}/), "Formato invalido"),
  managerId: z.string({
    required_error: "O id do manager é obrigatório",
  }),
  address: z.string().min(10, "Min 10"),
  coordenadas: z
    .number({ required_error: "As coordenadas da casa são obrigatório" })
    .array()
    .min(2, "Min 2")
    .max(2, "Max 2"),
});

export const formFilialContactoSchema = z.object({
  id: z.string(),
  email: z
    .string()
    .email("Formato invalido")
    .min(15, "Min 15")
    .max(255, "Max 255"),
  tel: z
    .string()
    .trim()
    .max(9, "Max 9")
    .min(9, "Min 9")
    .regex(new RegExp(/9[1-5][0-9]{7}/), "Formato invalido"),
});


export const filialStatuSchema = z.object({
  id:z.string(),
  status: z.enum(["aberta", "fechado"]),
});

export type filialStatusData = z.infer<typeof filialStatuSchema>;


export async function Filias(fastify: FastifyInstance) {
  const filialUseCase = new FilialUseCase();
  fastify.get("/", async (req, reply) => {
    const { name, status } = z
      .object({
        name: z.string(),
        status: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(
        await filialUseCase.getFilias({
          name,
          status,
        })
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.get("/get-over-view", async (req, reply) => {
    const { filialId } = z
      .object({
        filialId: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(await filialUseCase.getOverView(filialId));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/manager", async (req, reply) => {
    const { filialId } = z
      .object({
        filialId: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(await filialUseCase.getManager(filialId));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/available-manager", async (req, reply) => {
    try {
      return reply.send(await filialUseCase.getAvailableManagers());
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/update-manager", async (req, reply) => {
    const user = req.super;
    if (!user) return reply.code(401).send({ message: "Token invalido" });
    const { managerId, filialId, key } = z
      .object({
        filialId: z.string(),
        managerId: z.string().nullable(),
        key: z.string(),
      })
      .parse(req.body);
    try {
      return reply.send(
        await filialUseCase.updateFilialManager({
          filialId,
          managerId,
          key,
          id: user.id,
        })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.post("/create/manager", async (req, reply) => {
    const data = formManagerSchema.parse(req.body);
    try {
      return reply.send(await filialUseCase.createManager(data));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.post("/create", async (req, reply) => {
    const data = formFilialSchema.parse(req.body);
    try {
      return reply.send(await filialUseCase.create(data));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/update-contacts", async (req, reply) => {
    const data = formFilialContactoSchema.parse(req.body);
    try {
      return reply.send(await filialUseCase.updateContacto(data));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
    fastify.patch("/update-status", async (req, reply) => {
    const { status, id } = filialStatuSchema.parse(req.body);
    try {
     await filialUseCase.updateFilialStatus({
        status,
        id
      });
      return reply.code(200).send();
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.register(Agent, {
    prefix: "/agents",
  });
  fastify.register(Clients, {
    prefix: "/clients",
  });
  fastify.register(Driver, {
    prefix: "/drivers",
  });
  fastify.register(Recolha, {
    prefix: "recolhas",
  });
}
