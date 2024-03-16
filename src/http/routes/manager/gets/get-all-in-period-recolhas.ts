
// import { env } from "@/env";
// import { hackId } from "@/lib/hack";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
// import { UnauthorizedError } from "../../Errors";
// import { jwtPayloadSchema } from "../authentication";
import type { FastifyInstance } from "fastify";
import { db } from "../../../../db/connection";
// export const getAllReceiptInPeriod = new Elysia().guard(
//   {
//     headers: t.Object({
//       authorization: t.String(),
//     }),
//   },
//   (app) =>
//     app
//       .resolve(({ headers: { authorization } }) => {
//         const bearer = authorization.split(" ")[1];

//         if (!bearer) {
//           throw new UnauthorizedError();
//         }
//         const user = jwt.verify(bearer, env.JWT_SECRET_KEY) as jwtPayloadSchema;
//         if (!user) {
//           throw new UnauthorizedError();
//         }
//         return { user };
//       })

// );

// fastify.get("/all-receipt-in-period", async ({ user }) => {

export async function getRecolhas() {
  const startDate = dayjs().subtract(1, "M");
  return await db.recolha.findMany({
    where: {
      filialId: "da67b5d2-c5d9-4f01-bc78-b69785da5d1e",
      createdAt: {
        gte: startDate.startOf("day").toDate(),
      },
    },
    select: {
      id: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      },
      driver: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      },
      status: true,
      createdAt: true,
    },
  });
}
