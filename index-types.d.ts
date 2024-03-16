import { FastifyRequest } from 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        user?: jwtPayloadSchema
    }
    interface FastifyInstance {
        user?: jwtPayloadSchema
    }
}

export type jwtPayloadSchema = {
    id: string;
    filialId: string;
};


