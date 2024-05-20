import dayjs from "dayjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PdfUseCase } from "./pdf-usecase";

const recolhaProps = z.object({
  client: z.string().optional(),
  driver: z.string().optional(),
  status: z.enum(["pendente", "andamento", "finalizada", "cancelada", "all"]),
  range: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  }),
});
export type recolhaPdf = z.infer<typeof recolhaProps>;
export async function pdf(fastify: FastifyInstance) {
  const pdfUseCase = new PdfUseCase()
  fastify.post("/recolhas", async (req, rep) => {
    const {
      client,
      driver,
      status,
      range,
    } = recolhaProps.parse(req.body);
    try {
      rep.send(await pdfUseCase.recolha({ client, status, range, driver }))
    } catch (error) {
      rep.send(error)
    }
  });
}
