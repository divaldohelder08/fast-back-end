

import type { FastifyInstance } from "fastify";
import { MetricsUseCase } from "./metrics-usecase";

export async function Metrics(fastify: FastifyInstance) {
  const metricsUserCase = new MetricsUseCase();
    fastify.get("/popular-filias", async (req, reply) => {
    try {
      return reply.send(
        await metricsUserCase.popularFilias()
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send(error);
    }
  });
  fastify.get("/big-chart", async (req, reply) => {
    try {
      return reply.send(
        await metricsUserCase.bigChart()
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: `Erro ao buscar big chart ${error}` });
    }
  });
  fastify.get("/month-recolhas-amount", async (req, reply) => {
    try {
      return reply.send(
        await metricsUserCase.mothAmount()
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar month recolhas amount" });
    }
  });
  fastify.get("/day-recolhas-amount", async (req, reply) => {
    try {
      return reply.send(
        await metricsUserCase.dayRecolhasAmount()
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar day recolhas amount" });
    }
  });
  fastify.get("/month-canceled-recolhas-amount", async (req, reply) => {
    try {
      return reply.send(
        await metricsUserCase.monthCanceledRecolhasAmount()
      );
    } catch (error) {
      console.error(error);
      reply
        .code(500)
        .send({ message: "Erro ao buscar month canceled recolhas amount" });
    }
  });
  fastify.get("/month-payment-amount", async (req, reply) => {
    try {
      return reply.send(
        await metricsUserCase.paymentAmount()
      );
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar payment amount" });
    }
  });
}
