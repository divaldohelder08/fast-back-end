import { fakerPT_BR as faker } from "@faker-js/faker";
import chalk from "chalk";
import { db } from "../../src/db/connection";

interface seedRecolhasProps {
  recolhas: number;
}
export async function seedRecolhas({
  recolhas: recolhasLength,
}: seedRecolhasProps) {
  const filias = await db.filial.findMany();
  const recolhas = Array.from({ length: recolhasLength });

  for (const filial of filias) {
    const filialDrivers = await db.driver.findMany({
      where: { filialId: filial.id },
    });
    const filialClients = await db.client.findMany({
      where: { filialId: filial.id },
    });

    for (const recolha of recolhas) {
      /**
       * Criar recolhas finalizadas e canceladas
       */
      await db.recolha.create({
        data: {
          clientId: faker.helpers.arrayElement(filialClients).id,
          driverId: faker.helpers.arrayElement(filialDrivers).id,
          filialId: filial.id,
          comment: faker.lorem.text(),
          status: faker.helpers.arrayElement(["cancelada", "finalizada"]),
          distance: faker.number.float().toString(),
          duration: faker.number.float().toString(),
          directions: JSON.stringify(faker.science.chemicalElement(), null, 2),
        },
      });

      /**
       * criar recolhas em andamento
       *  - Teem drivers
       *  -  estão a ser executadas nesse exato momento
       *  - Já teem direções
       *  - Sem duração
       */
      await db.recolha.create({
        data: {
          clientId: faker.helpers.arrayElement(filialClients).id,
          driverId: faker.helpers.arrayElement(filialDrivers).id,
          filialId: filial.id,
          status: faker.helpers.arrayElement(["andamento"]),
          distance: faker.number.float().toString(),
          directions: JSON.stringify(faker.science.chemicalElement(), null, 2),
        },
      });

      /**
       * criar recolhas pendentes
       *  - Já teem drivers mais ainda ñ estão a ser executadas
       */

      await db.recolha.create({
        data: {
          clientId: faker.helpers.arrayElement(filialClients).id,
          driverId: faker.helpers.arrayElement(filialDrivers).id,
          filialId: filial.id,
          status: "pendente",
        },
      });
    }
  }

  console.log(chalk.yellow("recolhas seeded"));
}
