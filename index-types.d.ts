import { FastifyRequest } from "fastify";
import type { UpdateKeyProps } from "./src/http/routes/manager/settings/settings";
import type { z } from "zod";





declare module "fastify" {
  interface FastifyRequest {
    user?: jwtPayloadSchema;
  }
  interface FastifyInstance {
    user?: jwtPayloadSchema;
  }
}

export type jwtPayloadSchema = {
  id: string;
  filialId: string;
}

export interface decodedUserProps {
  id: string;
  filialId: string;
}

export interface decodedUserIdProps {
  id: string;
}

export interface decodedUserFilialIdProps {
  filialId: string;
}

export interface recolhaByIdProps extends decodedUserFilialIdProps {
  recolhaId: string;
}

interface clientByIdProps extends decodedUserFilialIdProps {
  id: string;
}

interface driverByIdExtendedProps extends decodedUserFilialIdProps  {
  id: string;
}
interface driverByIdProps  {
  driverId: string;
}
export interface deleteRecolhaProps extends decodedUserProps {
  clintId: string;
  key: string;
}


export interface deleteClientProps extends decodedUserProps {
  clintId: string;
  key: string;
}
export interface deleteAgentProps extends decodedUserProps {
  agentId: string;
  key: string;
}

export interface deleteDriverProps extends decodedUserProps {
  driverId: string;
  key: string;
}

export interface deleteAgentProps extends decodedUserProps {
  agentId:string,
  key:string
}

export interface updateKeyProps extends decodedUserIdProps {
  antiga:string
  nova:string
}