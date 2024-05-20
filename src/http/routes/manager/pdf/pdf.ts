import dayjs from "dayjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PdfUseCase } from "./pdf-usecase";

export async function Pdf(fastify: FastifyInstance) {
  const pdfUseCase = new PdfUseCase();
  fastify.get("/recolhas", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    const { client, driver, status, from, to } = z
      .object({
        client: z.string(),
        driver: z.string(),
        status: z.enum([
          "pendente",
          "andamento",
          "cancelada",
          "finalizada",
          "all",
        ]),
        from: z.coerce
          .date()
          .min(dayjs().subtract(90, "days").toDate())
          .optional(),
        to: z.coerce.date().max(dayjs().add(1, "minute").toDate()).optional(),
      })
      .parse(req.query);
    try {
      return reply.send(
        await pdfUseCase.recolhas({
          filialId: manager.filialId,
          client,
          driver,
          from,
          status,
          to,
        })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/clients", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    const { status } = z
      .object({
        status: z.enum(["npago", "pago", "all"]),
      })
      .parse(req.query);

    try {
      return reply.send(
        await pdfUseCase.clients({ status, filialId: manager.filialId })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/drivers", async (req, reply) => {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    const { status } = z
      .object({
        status: z.enum(["On", "Off", "all"]),
      })
      .parse(req.query);

    try {
      return reply.send(
        await pdfUseCase.drivers({ status, filialId: manager.filialId })
      );
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
