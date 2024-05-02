import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/connection";
import { decrypt } from "../../lib/jose";
import type { jwtPayloadSchema1 } from "../../types";
import { NotDriverError, UnauthorizedError } from "../routes/Errors";
import { paymentExpired } from "./remove-clients";
export async function DriverMiddleware(req: FastifyRequest, rep: FastifyReply) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return rep.code(401).send({ message: "Token missing" });
  await paymentExpired();
  try {
    const decodedToken = (await decrypt(token)) as jwtPayloadSchema1;
    if (!decodedToken) throw new UnauthorizedError();
    const driver = await db.driver.findUnique({
      where: {
        id: decodedToken.id,
        status: "On",
      },
    });
    if (!driver) throw new NotDriverError();
    req.driver = decodedToken;
  } catch (error) {
    console.error(error);
    rep.code(401).send({ message: "UNAUTHORIZED" });
  }
}
