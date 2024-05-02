import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { RecolhaUseCase } from "./recolhas-usecase";

export async function Recolha(fastify: FastifyInstance) {
  const recolhaUseCase = new RecolhaUseCase();
  fastify.get("/", async (req, reply) => {
    const driver = req.driver;
    if (!driver) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await recolhaUseCase.find(driver.id));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/:id/andamento", async (req, reply) => {
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    const { lat, lgn } = z
      .object({
        lat: z.number(),
        lgn: z.number(),
      })
      .parse(req.body);
    try {
      return reply.send(
        await recolhaUseCase.handleAndamento({
          id,
          lat,
          lgn,
        })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/:id/cancelar", async (req, reply) => {
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    try {
      return reply.send(await recolhaUseCase.handleCancel(id));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.patch("/:id/finalizar", async (req, reply) => {
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    try {
      return reply.send(await recolhaUseCase.handleFinalizar(id));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/validate", async (req, reply) => {
    const { status, id } = z
      .object({
        id: z.string(),
        status: z.enum(["pendente", "andamento", "cancelada", "finalizada"]),
      })
      .parse(req.query);
    try {
      return reply.send(
        await recolhaUseCase.validate({
          id,
          status,
        })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });

  // await api.get("/recolha/", {
  //   params: {
  //     id,
  //     : "andamento",
  //   },
  // });
}
