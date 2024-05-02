import type { FastifyInstance } from "fastify";
import { metricsUseCase } from "./metrics-usecase";

export async function Metrics(fastify: FastifyInstance) {
  fastify.get("/popular-drivers", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await metricsUseCase.popularDrivers(manager.filialId));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar motoristas populares" });
    }
  });
  fastify.get("/big-chart", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await metricsUseCase.bigChart(manager.filialId));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar big chart" });
    }
  });
  fastify.get("/month-recolhas-amount", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await metricsUseCase.mothAmount(manager.filialId));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar month recolhas amount" });
    }
  });
  fastify.get("/day-recolhas-amount", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(
        await metricsUseCase.dayRecolhasAmount(manager.filialId)
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar day recolhas amount" });
    }
  });
  fastify.get("/month-canceled-recolhas-amount", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(
        await metricsUseCase.monthCanceledRecolhasAmount(manager.filialId)
      );
    } catch (error) {
      console.error(error);
      reply
        .code(500)
        .send({ message: "Erro ao buscar month canceled recolhas amount" });
    }
  });
  fastify.get("/month-payment-amount", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    try {
      return reply.send(await metricsUseCase.paymentAmount(manager.filialId));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar payment amount" });
    }
  });
}
