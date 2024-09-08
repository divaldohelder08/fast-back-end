import chalk from "chalk";
import { seedFull } from "./use/full.seed";
import { seedSuperManagers } from "./use/supermanager.seed";
import { seedRecolhas } from "./use/recolha.seed";
import { db } from "../src/db/connection";
import { seedClients } from "./use/clients.seed";

await seedSuperManagers();
await seedFull({  drivers: 20 });
await seedClients({clients: 13})
await seedRecolhas({ recolhas: 51 });
console.table({
  clients: await db.client.count(),
  drivers: await db.driver.count(),
  filas: await db.filial.count(),
  managers: await db.manager.count(),
  agents: await db.agents.count(),
  recolhas: await db.recolha.count(),
});
console.log(chalk.greenBright("💥 Database seeded successfully!"));

process.exit();
