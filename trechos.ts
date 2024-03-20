// .error({
//   UNAUTHORIZED: UnauthorizedError,
//   NOT_A_MANAGER: NotAManagerError,
// })
// .onError(({ code, error, set }) => {
//     switch (code) {
//       case "UNAUTHORIZED":
//         set.status = 401;
//         return { code, message: error.message };
//       case "NOT_A_MANAGER":
//         set.status = 401;
//         return { code, message: error.message };
//     }

import { faker } from "@faker-js/faker";
import { sexo } from "./prisma/use/full.seed";
const sex = faker.helpers.enumValue(sexo);
const firstName = faker.person.firstName(sex === "M" ? "male" : "female");
const lastName = faker.person.lastName(sex === "M" ? "male" : "female");
const currentDriver = {
  name: faker.person.fullName({
    firstName,
    lastName,
  }),
  email: faker.internet.email({
    firstName,
    lastName,
    provider: "mukumbo.dev",
  }),
  sexo: sex,
};
console.log({
  name: currentDriver.name,
  email: currentDriver.email,
  sexo: currentDriver.sexo,
  coordenadas: faker.location.nearbyGPSCoordinate(),
  tel: faker.helpers.fromRegExp(/9[1-5][0-9]{7}/),
  numberBI: faker.helpers.fromRegExp(/[^a-zA-Z]{9}[^a-z0-9]{2}[^a-zA-Z]{2}/),
  nascimento: faker.date.past({ years: 30 }),
  avatar: faker.image.avatar(),
  matricula: faker.helpers
    .fromRegExp(/LD-[0-9]{2}-[0-9]{2}-[^0-9]{2}/)
    .toUpperCase(),
});
