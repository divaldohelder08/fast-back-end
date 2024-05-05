import { fakerPT_BR as faker } from "@faker-js/faker";
import chalk from "chalk";
import dayjs from "dayjs";
import { db } from "../../src/db/connection";
import { LastPayment } from "../../src/utils/last-payment";
import { sexo } from "./full.seed";
// Spell:ignore Currentclient
interface seedClientsProps {
  client: number;
}

export async function seedClients({
  clients: clientsLength,
}: {
  clients: number;
}) {
  const filias = await db.filial.findMany();
  for (const filial of filias) {
    const agents = await db.agents.findMany({
      where: {
        filialId: filial.id,
      },
    });
    Array.from({ length: clientsLength }).map(async (e) => {
      const sex = faker.helpers.enumValue(sexo);
      const firstName = faker.person.firstName(sex === "M" ? "male" : "female");
      const lastName = faker.person.lastName(sex === "M" ? "male" : "female");
      const Currentclient = {
        name: faker.person
          .fullName({
            firstName,
            lastName,
          })
          .toLocaleLowerCase(),
        email: faker.internet
          .email({
            firstName,
            lastName,
          })
          .toLocaleLowerCase(),
        sexo: sex,
      };
      await db.payment.create({
        data: {
          endAt: dayjs().add(1, "month").startOf("day").toDate(),
          agentId: faker.helpers.arrayElement(agents).id,
          priceId: (await LastPayment()).id,
          Client: {
            create: {
              name: Currentclient.name,
              email: Currentclient.email,
              sexo: Currentclient.sexo,
              address: faker.location.streetAddress({
                useFullAddress: true,
              }),
              status: "pago",
              filialId: filial.id,
              coordenadas: faker.location.nearbyGPSCoordinate({
                origin: [filial.coordenadas[0], filial.coordenadas[1]],
              }),
              tel: faker.helpers.fromRegExp(/9[1-5][0-9]{7}/),
              numberBI: faker.helpers.fromRegExp(
                /[^a-zA-Z]{9}[^a-z0-9]{2}[^a-zA-Z]{3}/
              ),
              nascimento: faker.date.past({ years: 30 }),
              avatar: faker.image.avatar(),
            },
          },
        },
      });
    });
  }
  console.log(chalk.yellow("Clients seeded"));
}
