import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/connection";
import { decrypt } from "../../lib/jose";
import type { jwtPayloadSchema } from "../../types";
import { NotAManagerError, UnauthorizedError } from "../routes/Errors";
import { paymentExpired } from "./remove-clients";
export async function AuthManager(req: FastifyRequest, rep: FastifyReply) {
console.log("0asijuhfbjsldkfjhubewhsd")
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  console.log(token,"wtsf")
  if (!token) return rep.code(401).send({ message: "Token missing" });
  await paymentExpired();
  try {
    const decodedToken = (await decrypt(token)) as jwtPayloadSchema;
console.log("em cima")
    console.log(decodedToken)
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
