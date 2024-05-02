import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { DriverUseCase } from "../../../manager/driver/driver-usecase";

export default async function Driver(fastify: FastifyInstance) {
  const driverUseCase = new DriverUseCase();
  fastify.get("/", async (req, reply) => {
    const { filialId } = z
      .object({
        filialId: z.string(),
      })
      .parse(req.query);
    try {
      return reply.send(await driverUseCase.find(filialId));
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
}
