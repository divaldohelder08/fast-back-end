import type { FastifyRequest, FastifyReply } from "fastify";

class MiddlewareValidation {
  manager({ req, reply }: { req: FastifyRequest; reply: FastifyReply }) {
    const manager = req.manager;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    return { id: manager.id, filialId: manager.filialId };
  }
  agent({ req, reply }: { req: FastifyRequest; reply: FastifyReply }) {
    const agent = req.agent;
    if (!agent) return reply.code(401).send({ message: "Token invalido" });
    return agent;
  }
  client({ req, reply }: { req: FastifyRequest; reply: FastifyReply }) {
    const client = req.client;
    if (!client) return reply.code(401).send({ message: "Token invalido" });
    return client;
  }
  driver({ req, reply }: { req: FastifyRequest; reply: FastifyReply }) {
    const driver = req.driver;
    if (!driver) return reply.code(401).send({ message: "Token invalido" });
    return driver;
  }
  super({ req, reply }: { req: FastifyRequest; reply: FastifyReply }) {
    const manager = req.super;
    if (!manager) return reply.code(401).send({ message: "Token invalido" });
    return manager;
  }
}

export const middlewareValidation = new MiddlewareValidation();
