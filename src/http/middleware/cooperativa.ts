import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/connection";
import { decrypt } from "../../lib/jose";
import type { jwtPayloadSchema1 } from "../../types";
import { UnauthorizedError } from "../routes/Errors";
import { paymentExpired } from "./remove-clients";
export async function AuthCooperativa(req: FastifyRequest, rep: FastifyReply) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return rep.code(401).send({ message: "Token missing" });
  await paymentExpired();
  try {
    const decodedToken = (await decrypt(token)) as jwtPayloadSchema1;
    if (!decodedToken) {
      throw new UnauthorizedError();
    }
    const manager = await db.manager.findUnique({
      where: { id: decodedToken.id, role: "superGerente" },
    });
 
    if (!manager) {
      throw new UnauthorizedError();
    }
    req.super = decodedToken;
  } catch (error) {
    console.error(error);
    rep.code(401).send({ message: "UNAUTHORIZED" });
  }
}
