import type { FastifyReply, FastifyRequest } from "fastify";
import type { jwtPayloadSchema } from "../../../index-types";
import { decrypt } from "../../lib/jose";
import { db } from "../../db/connection";
import { NotAManagerError } from "../routes/Errors";
export async function AuthManager(req: FastifyRequest, rep: FastifyReply) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return rep.code(401).send({ message: "Token missing" });
  try {
    const decodedToken = (await decrypt(token)) as jwtPayloadSchema;
    if (!decodedToken) throw new Error("Token invalid");
    const manager = await db.filial.findFirst({
      where: { id: decodedToken.filialId, managerId: decodedToken.id },
    });
    if (!manager) throw new NotAManagerError();
    req.user = decodedToken;
  } catch (error) {
    console.error(error);
    rep.code(401).send({ message: "UNAUTHORIZED" });
  }
}
