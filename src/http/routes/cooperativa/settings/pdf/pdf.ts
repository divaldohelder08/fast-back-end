import dayjs from "dayjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PdfUseCase } from "./pdf-usecase";

const recolhaQuery = z.object({
  client: z.string(),
  driver: z.string(),
  filialId: z.string(),
  status: z.enum(["pendente", "andamento", "cancelada", "finalizada", "all"]),
  from: z.coerce.date().min(dayjs().subtract(90, "days").toDate()).optional(),
  to: z.coerce.date().optional(),
});

const clientQuery = z.object({
  filialId: z.string(),
  status: z.enum(["npago", "pago", "all"]),
});

const driversQuery = z.object({
  filialId: z.string(),
  status: z.enum(["On", "Off", "all"]),
});

export type recolhaQueryProps = z.infer<typeof recolhaQuery>;
export type clientQueryProps = z.infer<typeof clientQuery>;
export type driversQueryProps = z.infer<typeof driversQuery>;

export async function Pdf(fastify: FastifyInstance) {
  const pdfUseCase = new PdfUseCase();
  fastify.get("/recolhas", async (req, reply) => {
    const { filialId, client, driver, from, status, to } = recolhaQuery.parse(
      req.query
    );
    try {
      return reply.send(
        await pdfUseCase.recolhas({
          filialId,
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
    const { status, filialId } = clientQuery.parse(req.query);
    try {
      return reply.send(await pdfUseCase.clients({ status, filialId }));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  fastify.get("/drivers", async (req, reply) => {
    const { status, filialId } = driversQuery.parse(req.query);
    try {
      return reply.send(await pdfUseCase.drivers({ status, filialId }));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
