import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/connection";
import { decrypt } from "../../lib/jose";
import type { jwtPayloadSchema } from "../../types";
import { NotAManagerError, UnauthorizedError } from "../routes/Errors";
export async function AuthManager(req: FastifyRequest, rep: FastifyReply) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return rep.code(401).send({ message: "Token missing" });
  try {
    const decodedToken = (await decrypt(token)) as jwtPayloadSchema;
    if (!decodedToken) throw new UnauthorizedError();
    const manager = await db.filial.findUnique({
      where: { id: decodedToken.filialId, managerId: decodedToken.id },
    });
    if (!manager) throw new NotAManagerError();
    req.manager = decodedToken;
  } catch (error) {
    console.error(error);
    rep.code(401).send({ message: "UNAUTHORIZED" });
  }
}
