import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { DriverMiddleware } from "../../middleware/driver";
import { DriverUseCase } from "./driver-usecase";
import { Recolha } from "./recolhas/recolhas";
import { Settings } from "./settings/settings";
import { Driverschema, Schema } from "../../../lib/swagger";

export const DriverAuthSchema = z.object({
  email: z.string().email({ message: "Formato de email inválido" }),
  password: z.string(),
});
export type driverAuthData = z.infer<typeof DriverAuthSchema>;

export default async function Driver(fastify: FastifyInstance) {
  const driverUseCase = new DriverUseCase();
  fastify.addHook("preHandler", DriverMiddleware);
  fastify.get("/profile", Driverschema, async (req, reply) => {
    const driver = req.driver;
    if (!driver) return reply.code(401).send({ message: "Token invalido" });
    try {
      const profile = await driverUseCase.profile(driver.id);
      return reply.send(profile);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: "Erro ao buscar perfil" });
    }
  });
  fastify.register(Recolha, {
    prefix: "/recolhas",
  });
  fastify.register(Settings, {
    prefix: "/settings",
  });
}
