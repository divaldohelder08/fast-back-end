import fs from "node:fs";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { db } from "../../../../../db/connection";
import { printer } from "../../../../../lib/pdfMake-client";
import split from "../../../../../utils/split";
import type {
  clientQueryProps,
  driversQueryProps,
  recolhaQueryProps,
} from "./pdf";

export class PdfUseCase {
  async recolhas({
    client,
    driver,
    status,
    from,
    to,
    filialId,
  }: recolhaQueryProps) {
    const filial = filialId === "all" ? undefined : filialId;
    const filters =
      status === "all"
        ? {
            filialId: filial,
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
            status: status,
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
            name: true,
          },
        },
        driver: {
          select: {
            name: true,
          },
        },
        distance: true,
        duration: true,
        status: true,
        filial: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        filialId: "desc",
      },
    });

    if (!recolhas[0])
      throw new Error("Nenhum registro encontrado com os filtros fornecidos");

    return recolhas;
  }
  async clients({ status, filialId }: clientQueryProps) {
    const filial = filialId === "all" ? undefined : filialId;
    const filters =
      status === "all"
        ? {
            filialId: filial,
          }
        : {
            status,
            filialId: filial,
          };

    const clients = await db.client.findMany({
      select: {
        id: true,
        numberBI: true,
        name: true,
        email: true,
        sexo: true,
        address: true,
        tel: true,
        status: true,
        filial: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        filialId: "asc",
      },
      where: filters,
    });
    if (!clients[0])
      throw new Error("Nenhum registro encontrado com os filtros fornecidos");

    return clients;
  }
  async drivers({ filialId, status }: driversQueryProps) {
    const filial = filialId === "all" ? undefined : filialId;
    const filters =
      status === "all"
        ? { filialId: filial }
        : {
            status,
            filialId: filial,
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
        filial: {
          select: {
            name: true,
          },
        },
        veiculo: {
          select: {
            matricula: true,
          },
        },
      },
      orderBy: {
        filialId: "asc",
      },
    });

    if (!drivers[0])
      throw new Error("Nenhum registro encontrado com os filtros fornecidos");
    return drivers;
  }
}
