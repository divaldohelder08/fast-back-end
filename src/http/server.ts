import fastify from "fastify";
import { seedRecolhas } from "../db/setRecolhas";
import { Finds } from "./routes/finds/finds";
import { Manager, authenticateSchema } from "./routes/manager/manager";
import { ManagerUseCase } from "./routes/manager/manager-usecase.ts";

const app = fastify();

app.register(Finds, {
  prefix: "/find",
});

app.register(Manager, {
  prefix: "/manager",
});
app.post("/manager/authenticate", async (req, reply) => {
  const managerUseCase = new ManagerUseCase();
  const { email, filialId, password } = authenticateSchema.parse(req.body);
  try {
    const thing = await managerUseCase.authenticate({
      email,
      filialId,
      password,
    });
    return reply.send(thing);
  } catch (error) {
    console.error(error);
  }
});

setInterval(
  async () => {
    await seedRecolhas();
  },
  Math.floor(Math.random() * 500000)
);
app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log(`🔥 HTTP server running at http://localhost:3333`);
  });
