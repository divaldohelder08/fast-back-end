import fs from "node:fs";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { db } from "../../../../db/connection";
import { printer } from "../../../../lib/pdfMake-client";
import type {
  PdfClientStatus,
  PdfGlobalStatus,
  PdfRecolhaStatus,
} from "../../../../types";
import split from "../../../../utils/split";
export class PdfUseCase {
  async recolhas({
    client,
    driver,
    status,
    from,
    to,
    filialId,
  }: {
    filialId: string;
    client: string;
    driver: string;
    status: PdfRecolhaStatus;
    from: Date | undefined;
    to: Date | undefined;
  }) {
    const filters =
      status === "all"
        ? {
            filialId,
            client: {
              name: {
                contains: client,
              },
            },
            driver: {
              name: {
                contains: driver,
              },
            },
            createdAt: {
              gte: from,
              lte: to,
            },
          }
        : {
            filialId,
            status,
            client: {
              name: {
                contains: client,
              },
            },
            driver: {
              name: {
                contains: driver,
              },
            },
            createdAt: {
              gte: from,
              lte: to,
            },
          };

    const recolhas = await db.recolha.findMany({
      where: filters,
      select: {
        id: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        distance: true,
        duration: true,
        status: true,
        createdAt: true,
      },
    });

    if (!recolhas[0]) throw new Error("Nenhum registro encontrado");
    return recolhas
  }
  async clients({
    status,
    filialId,
  }: {
    status: PdfClientStatus;
    filialId: string;
  }) {
    const filters =
      status === "all"
        ? {
            filialId,
          }
        : {
            status,
            filialId,
          };
    const clients = await db.client.findMany({
      where: filters,
    });
    if (!clients[0]) throw new Error("Nenhum registro encontrado");
    return clients
   }
 async drivers({
    filialId,
    status,
  }: {
    status: PdfGlobalStatus;
    filialId: string;
  }) {
    const filters =
      status === "all"
        ? { filialId }
        : {
            status,
            filialId,
          };
    const drivers = await db.driver.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        email: true,
        numberBI: true,
        nascimento: true,
        createdAt: true,
        status: true,
        tel: true,
        sexo: true,
        veiculo: {
          select: {
            matricula: true,
          },
        },
      },
    });
    if (!drivers[0]) throw new Error("Nenhum registro encontrado");
    return drivers;
  }
}
