import { SignJWT, jwtVerify } from "jose";
import type { jwtPayloadSchema } from "../../index-types";

const secret = "secret"
const key = new TextEncoder().encode(secret)


export async function encrypt(payload: jwtPayloadSchema) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"]
    })
    return payload
}