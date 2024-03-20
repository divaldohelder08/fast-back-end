// import { seedRecolhas } from "@/db/setRecolhas";
// import { cors } from "@elysiajs/cors";
// import { Elysia, t } from "elysia";
// import { indexCooperativa } from "./routes/cooperativa/_index-cooperativa";
// import { indexDriver } from "./routes/driver/_index-driver";
// import { indexManager } from "./routes/manager/_index-manager";
// import { FindPlace } from "./routes/maps/places/find-place";
// import { GetRecolhaById } from "./routes/mult/get-recolha-by-id";
// const app = new Elysia()
//   .use(
//     cors({
//       credentials: true,
//       allowedHeaders: ["content-type", "Authorization"],
//       methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
//       origin: (request): boolean => {
//         const origin = request.headers.get("origin");

//         if (!origin) {
//           return false;
//         }

//         return true;
//       },
//     }),
//   )
//   .use(FindPlace)
//   .group("/find", (app) => {
//       .get(
//         "/filial/:id",
//         async ({ params }) => {
//           const { id } = params;
//           return db.filial.findUnique({
//             select: { id: true, name: true },
//             where: { id },
//           });
//         },
//         {
//           params: t.Object({
//             id: t.String(),
//           }),
//         },
//       );
//   })
//   .group("/driver", (app) => app.use(indexDriver))
//   .group("/manager", (app) => app.use(indexManager))
//   .group("/cooperativa", (app) => app.use(indexCooperativa));
// // .get("/pdf", async ({ set }) => {
// //   // set.headers('Content-Type', 'application/pdf');
// //   // set.headers('Content-Disposition', 'attachment; filename=agendamento.pdf');
// //   return Bun.file("src/agendamento.pdf");
// // });
