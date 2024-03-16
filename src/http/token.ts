import jwt from "jsonwebtoken";

import type { jwtPayloadSchema } from "../../index-types";
import { db } from "../db/connection";
export class TokenUseCase {
    decode(token: string) {
        const decodedToken = jwt.verify(token, "ola") as jwtPayloadSchema;
        if (!decodedToken) throw new Error("Token invalid sdfsdfsdf")
        return decodedToken
    }
    verify(token: string, role: "manager" | "super-gerent" | "agent" | "driver" | "client") {
        const decodedToken = this.decode(token)
        switch (role) {
            case "manager":
                return this.manager(decodedToken)
            case "super-gerent":
                return this.superGerent(decodedToken)
            case "agent":
                return this.agent(decodedToken)
            case "driver":
                return this.driver(decodedToken)
            case "client":
                return this.client(decodedToken)
        }
    }
    async manager(decoded: jwtPayloadSchema) {
        const manager = await db.filial.findFirst({ where: { id: decoded.filialId, managerId: decoded.id } })
        if (!manager) throw new Error("Not a manager or filial not found")
        return decoded
    }
    async superGerent(decoded: jwtPayloadSchema) {
        const superGerent = await db.manager.findFirst({ where: { id: decoded.id, role: "superGerente" } })
        if (!superGerent) throw new Error("Not a super gerent")
        return decoded
    }
    async agent(decoded: jwtPayloadSchema) {
        const agent = await db.agents.findFirst({ where: { id: decoded.id } })
        if (!agent) throw new Error("Not an agent")
        return decoded
    }
    async driver(decoded: jwtPayloadSchema) {
        const driver = await db.driver.findFirst({ where: { id: decoded.id } })
        if (!driver) throw new Error("Not a driver")
        return decoded
    }
    async client(decoded: jwtPayloadSchema) {
        const client = await db.client.findFirst({ where: { id: decoded.id } })
        if (!client) throw new Error("Not a client")
        return decoded
    }
}