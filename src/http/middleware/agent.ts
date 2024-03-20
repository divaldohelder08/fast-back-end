import type { FastifyReply, FastifyRequest } from "fastify";
import type { jwtPayloadSchema } from "../../../index-types";
import { decrypt } from "../../lib/jose";
import { db } from "../../db/connection";
import { NotAManagerError, NotAgentError, UnauthorizedError } from "../routes/Errors";
export async function AgentMiddleware(req: FastifyRequest, rep: FastifyReply) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return rep.code(401).send({ message: "Token missing" });
  try {
    const decodedToken = (await decrypt(token)) as jwtPayloadSchema;
    if (!decodedToken) throw new UnauthorizedError();
    const agent = await db.agents.findFirst({
      where: { id: decodedToken.id, filialId: decodedToken.filialId },
    });
    if (!agent) throw new NotAgentError();
    req.user = decodedToken;
  } catch (error) {
    console.error(error);
    rep.code(401).send({ message: "UNAUTHORIZED" });
  }
}
