import type { FastifyInstance } from "fastify"
import { FindUseCase } from "./find-useCase"
import { z } from "zod"
import { Schema } from "../../../lib/swagger"
const schema = { schema: Schema(["finds"]) }

export async function Finds(fastify: FastifyInstance) {
    const findUseCase = new FindUseCase()
    fastify.get("/filias", schema, async (req, reply) => {
        try {
            return reply.send(await findUseCase.filias())
        } catch (error) {
            console.error(error)
        }
    })
    fastify.get("/agents", schema, async (req, reply) => {
        try {
            return reply.send(await findUseCase.agents())
        } catch (error) {
            console.error(error)
        }
    })
    fastify.get("/filial/:id", schema, async (req, reply) => {
        const { id } = z.object({
            id: z.string()
        }).parse(req.params)
        try {
            return reply.send(await findUseCase.findName({ id }))
        } catch (error) {
            console.error(error)
            reply.send(error)
        }
    })

    fastify.get("/clients", schema, async (req, reply) => {
        try {
            return reply.send(await findUseCase.clients())
        } catch (error) {
            console.error(error)
        }
    })
    fastify.get("/drivers", schema, async (req, reply) => {
        try {
            return reply.send(await findUseCase.drivers())
        } catch (error) {
            console.error(error)
        }
    })
    fastify.get("/managers", schema, async (req, reply) => {
        try {
            return reply.send(await findUseCase.managers())
        } catch (error) {
            console.error(error)
        }
    })
}