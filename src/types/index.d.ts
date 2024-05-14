import "fastify";

export interface geoMapFilter extends filialId {
  numberBI: string;
}

export interface geoMapFilter1 {
  numberBI: string;
}

declare module "fastify" {
  interface FastifyRequest {
    manager?: jwtPayloadSchema;
    super?: jwtPayloadSchema1;
    agent?: jwtPayloadSchema;
    driver?: jwtPayloadSchema1;
    client?: jwtPayloadSchema;
  }
  interface FastifyInstance {
    manager?: jwtPayloadSchema;
    super?: jwtPayloadSchema1;
    agent?: jwtPayloadSchema;
    driver?: jwtPayloadSchema1;
    client?: jwtPayloadSchema;

  }
}

export interface GroupedData {
  [key: string]: {
    recolhas: number;
    data: string;
  };
}
export interface GroupedDataHeatMap {
  [key: string]: {
    count: number;
    data: string;
  };
}

export type jwtPayloadSchema = {
  id: string;
  filialId: string;
};
export type jwtPayloadSchema1 = {
  id: string;
};

export interface decodedUserProps {
  id: string;
  filialId: string;
}

export interface decodedUserIdProps {
  id: string;
}

export interface filialId {
  filialId: string;
}

export interface recolhaByIdProps {
  recolhaId: string;
}

interface clientByIdProps extends filialId {
  id: string;
}

interface driverByIdExtendedProps extends filialId {
  id: string;
}
interface driverByIdProps {
  driverId: string;
}
export interface deleteRecolhaProps extends decodedUserProps {
  recolhaId: string;
}

export interface deleteClientProps extends decodedUserProps {
  clintId: string;
  key: string;
}

export interface deleteDriverProps extends decodedUserProps {
  driverId: string;
  key: string;
}

export interface deleteAgentProps extends decodedUserProps {
  agentId: string;
  key: string;
}

export interface updateKeyProps extends decodedUserIdProps {
  antiga: string;
  nova: string;
}

export type PdfRecolhaStatus =
  | "pendente"
  | "andamento"
  | "cancelada"
  | "finalizada"
  | "all";
export type PdfClientStatus = "npago" | "pago" | "all";
export type PdfGlobalStatus = "On" | "Off" | "all";
