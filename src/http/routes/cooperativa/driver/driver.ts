import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { DriverUseCase } from "./driver-usecase";

export default async function Driver(fastify: FastifyInstance) {
  const driverUseCase = new DriverUseCase();
  fastify.get("/", async (req, reply) => {
    const user = req.super;
    if (!user) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await driverUseCase.find());
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/:id", async (req, reply) => {
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    const user = req.super;
    if (!user) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await driverUseCase.findById(id));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/geo-map", async (req, reply) => {
    const user = req.super;
    if (!user) return reply.code(401).send({ message: "Token invalido" });
    const { numberBI } = z
      .object({
        numberBI: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(
        await driverUseCase.geoMap({
          numberBI,
        })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.delete("/:id", async (req, reply) => {
    const { key } = z
      .object({
        key: z.string(),
      })
      .parse(req.query);
    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(req.params);
    const user = req.super;
    if (!user) return reply.code(401).send({ message: "Token invalido" });
    try {
      await driverUseCase.delete({
        id: user.id,
        key,
        driverId: id,
      });
      return reply
        .code(200)
        .send({ message: "Motorista apagado com sucesso!" });
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
