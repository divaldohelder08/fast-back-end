import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/connection";
import { decrypt } from "../../lib/jose";
import type { jwtPayloadSchema } from "../../types";
import { NotClientError, UnauthorizedError } from "../routes/Errors";
export async function ClientMiddleware(req: FastifyRequest, rep: FastifyReply) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return rep.code(401).send({ message: "Token missing" });
  try {
    const decodedToken = (await decrypt(token)) as jwtPayloadSchema;
    if (!decodedToken) throw new UnauthorizedError();
    const cliente = await db.client.findUnique({
      where: {
        id: decodedToken.id,
        filialId: decodedToken.filialId,
      },
    });
    if (!cliente) throw new NotClientError();
    req.client = decodedToken;
  } catch (error) {
    console.error(error);
    rep.code(401).send({ message: "UNAUTHORIZED" });
  }
}
