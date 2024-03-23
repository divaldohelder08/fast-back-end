import { db } from "../../../../../db/connection";
import type { recolhaPdf } from "./pdf";

interface recolhaProps extends recolhaPdf {}

export class PdfUseCase {
  async recolha({ range, status, client, driver }: recolhaProps) {
    if (status === "all") {
     return await db.recolha.findMany({
        where: {
          clientId: {
            contains: client,
          },
          driverId: {
            contains: driver,
          },
          createdAt: {
            gte: range.from,
            lte:range.to
          },
        },
      });
    }else {
      return await db.recolha.findMany({
        where: {
          clientId: {
            contains: client,
          },
          driverId: {
            contains: driver,
          },
          status,
          createdAt: {
            gte: range.from,
            lte:range.to
          },
        },
      });
    }
  }
}
