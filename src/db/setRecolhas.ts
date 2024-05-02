import { fakerPT_BR as faker } from "@faker-js/faker";
import chalk from "chalk";
import dayjs from "dayjs";
import { db } from "./connection";

export async function seedRecolhas() {
  const filial = faker.helpers.arrayElement(await db.filial.findMany());

  if (!filial) return;
  const filialDrivers = await db.driver.findMany({
    where: { filialId: filial?.id },
  });
  const filialClients = await db.client.findMany({
    where: { filialId: filial?.id },
  });

  await db.recolha.create({
    data: {
      clientId: faker.helpers.arrayElement(filialClients).id,
      driverId: faker.helpers.arrayElement(filialDrivers).id,
      filialId: filial?.id,
      comment: faker.lorem.text(),
      status: faker.helpers.arrayElement(["cancelada"]),
      distance: faker.number.float().toString(),
      duration: faker.number.float().toString(),
      directions: JSON.stringify(faker.science.chemicalElement(), null, 2),
      createdAt: dayjs().toDate(),
    },
  });

  await db.recolha.create({
    data: {
      clientId: faker.helpers.arrayElement(filialClients).id,
      driverId: faker.helpers.arrayElement(filialDrivers).id,
      comment: faker.lorem.text(),
      filialId: filial?.id,
      status: "pendente",
    },
  });
  console.log(chalk.yellow("recolhas seeded"));
}
