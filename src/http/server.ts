import cors from "@fastify/cors";
import fastify from "fastify";
import { z } from "zod";
import { db } from "../db/connection";
import { seedRecolhas } from "../db/setRecolhas";
import {
  Agent,
  authenticateSchema as agentAuthSchema,
} from "./routes/agent/agent";
import { agentUseCase } from "./routes/agent/agent-usecase";
import {
  Cooperativa,
  authenticateSchema as cooperativaAuthSchema,
} from "./routes/cooperativa/cooperativa";
import { CooperativaUseCase } from "./routes/cooperativa/cooperativa-usecase";
import { PriceUseCase } from "./routes/cooperativa/settings/price/prece-usecase";
import { DriverUseCase } from "./routes/driver/driver-usecase";
import { Finds } from "./routes/finds/finds";
import { Manager, authenticateSchema } from "./routes/manager/manager";
import { managerUseCase } from "./routes/manager/manager-usecase";
import { RecolhaUseCase } from "./routes/manager/recolha/recolha-usecase";
import Driver, { DriverAuthSchema } from "./routes/driver/driver";
import Client, { ClientAuthSchema } from "./routes/client/client";
import { ClientUseCase } from "./routes/client/client-usecase";
import cron from "node-cron";
import { paymentExpired } from "./middleware/remove-clients";
import SwaggerJson from "./swagger.json"
import { Sms } from "./routes/cooperativa/settings/sms/sms";

cron.schedule("0 0 * * *", async () => {
  await paymentExpired();
  console.log("payments revisados.");
});

const app = fastify();
app.register(import("@fastify/swagger"))
app.register(import("@fastify/swagger-ui"), {
  routePrefix: '/',
})
app.register(import("@fastify/websocket"));
app.register(import("@fastify/rate-limit"), {
  max: 1000,
  timeWindow: "10 minutes",
});

app.register(cors, {
  origin: "*",
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Accept",
    "Content-Type",
    "Authorization",
    "authorization",
  ],
  methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
});

app.get("/recolhas/:id", async (req, reply) => {
  const { id } = z
    .object({
      id: z.string(),
    })
    .parse(req.params);
  const recolhaUseCase = new RecolhaUseCase();

  try {
    return reply.send(
      await recolhaUseCase.findById({
        recolhaId: id,
      })
    );
  } catch (error) {
    reply.send(error);
  }
});

app.register(Finds, {
  prefix: "/find",
});

// Manager routes

app.register(Manager, {
  prefix: "/manager",
});

app.get("/managers", async (req, reply) => {
  try {
    return reply.send(
      await db.filial.findMany({
        select: { name: true, manager: { select: { email: true } } },
      })
    );
  } catch (error) {
    console.error(error);
    reply.code(404).send(error);
  }
});

app.post("/manager/authenticate", async (req, reply) => {
  const { email, filialId, password } = authenticateSchema.parse(req.body);
  try {
    return reply.send(
      await managerUseCase.authenticate({
        email,
        filialId,
        password,
      })
    );
  } catch (error) {
    console.error(error);
    reply.code(404).send(error);
  }
});

// Agent routes

app.register(Agent, {
  schema: {
    tags: ["Agent"],
  },
  prefix: "/agent",
});

app.post("/agent/authenticate", async (req, reply) => {
  const { email, filialId } = agentAuthSchema.parse(req.body);
  try {
    return reply.send(
      await agentUseCase.authenticate({
        email,
        filialId,
      })
    );
  } catch (error) {
    console.error(error);
    reply.code(404).send(error);
  }
});

app.get("/agents/:id", async (req, reply) => {
  const { id } = z
    .object({
      id: z.string(),
    })
    .parse(req.params);

  try {
    return reply.send(await agentUseCase.findById(id));
  } catch (error) {
    reply.code(500).send(error);
  }
});

// Driver routes

app.register(Driver, {
  prefix: "/driver",
});

app.post("/driver/authenticate", async (req, reply) => {
  const driverUseCase = new DriverUseCase();
  const { email, password } = DriverAuthSchema.parse(req.body);
  try {
    return reply.send(
      await driverUseCase.authenticate({
        email,
        password,
      })
    );
  } catch (error) {
    console.error(error);
    reply.code(404).send(error);
  }
});

// Cliente routes

app.register(Client, {
  prefix: "/client",
});

app.post("/client/authenticate", async (req, reply) => {
  const clientUseCase = new ClientUseCase();
  const { email, password } = ClientAuthSchema.parse(req.body);
  try {
    return reply.send(
      await clientUseCase.authenticate({
        email,
        password,
      })
    );
  } catch (error) {
    console.error(error);
    reply.code(404).send(error);
  }
});

// Super-Manager routes

app.register(Cooperativa, {
  prefix: "/cooperativa",
});

app.post("/cooperativa/authenticate", async (req, reply) => {
  const cooperativaUseCase = new CooperativaUseCase();
  const { email, password } = cooperativaAuthSchema.parse(req.body);
  try {
    return reply.send(
      await cooperativaUseCase.authenticate({
        email,
        password,
      })
    );
  } catch (error) {
    console.error(error);
    reply.code(404).send(error);
  }
});

const priceUseCase = new PriceUseCase();
app.get("/price", async (req, reply) => {
  try {
    return reply.send(await priceUseCase.getPrice());
  } catch (error) {
    console.error(error);
    reply.send(error);
  }
});

app.get("/merd/:id", async (req, reply) => {
  const { id } = z.object({
    id: z.string()
  }).parse(req.params);
  try {
    return db.recolha.update({
      where: {
        id,
      },
      data: {
        status: "pendente"
      }
    });
  } catch (error) {
    console.error(error);
    reply.code(404).send(error);
  }
});

/* setInterval(
    async () => {
      await seedRecolhas();
    },
Math.floor(Math.random() * 99999)
//   Math.floor(Math.random() * 80)
  ); */

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then((e) => {
    console.log("🔥 HTTP server on port", e);
  });
