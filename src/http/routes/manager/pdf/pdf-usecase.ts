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

    const body = new Array();

    for await (let recolha of recolhas) {
      const rows = new Array();
      rows.push(recolha.id);
      rows.push(
        `${split.name(recolha.client?.name ?? "")} \n\ ${recolha.client?.id}`
      );
      rows.push(
        `${split.name(recolha.driver?.name ?? "")} \n\ ${recolha.driver?.id}`
      );
      rows.push({ text: recolha.status });
      rows.push({ text: recolha?.distance ?? "Não informado" });
      rows.push({ text: recolha?.status ?? "Não informado" });

      rows.push(new Date(recolha.createdAt).toLocaleDateString());
      body.push(rows);
    }

    const docDefinitions: TDocumentDefinitions = {
      pageSize: "A3",
      pageOrientation: "landscape",
      defaultStyle: { font: "Helvetica" },
      content: [
        {
          columns: [{ text: "Recolhas da Filial\n\n", style: "header" }],
        },
        {
          table: {
            body: [
              [
                { text: "ID", style: "columnsTitle" },
                { text: "Cliente", style: "columnsTitle" },
                { text: "Motorista", style: "columnsTitle" },
                { text: "Status", style: "columnsTitle" },
                { text: "Distancia", style: "columnsTitle" },
                { text: "Duração", style: "columnsTitle" },
                { text: "CreatedAt", style: "columnsTitle" },
              ],
              ...body,
            ],
          },
        },
      ],
      styles: {
        textName: {
          noWrap: false,
        },
        center: {
          alignment: "center",
        },
        columnsName: {
          fontSize: 12,
          bold: false,
          color: "#666666",
          alignment: "left",
        },
        header: {
          fontSize: 14,
          bold: true,
          alignment: "center",
        },
        filters: {
          fontSize: 12,
          bold: false,
          alignment: "left",
        },
        columnsTitle: {
          fontSize: 12,
          bold: false,
          color: "#666666",
          alignment: "left",
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinitions);
    pdfDoc.pipe(fs.createWriteStream("Relatório.pdf"));
    const guardado = new Array();

    pdfDoc.on("data", (data: any) => {
      guardado.push(data);
    });
    pdfDoc.end();

    pdfDoc.on("end", () => {
      return Buffer.concat(guardado);
    });
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

    const body = new Array();
    for await (let client of clients) {
      const rows = new Array();
      const statusClasse = client.status === "npago" ? "statusOff" : "statusOn";
      rows.push(client.id);
      rows.push(client.numberBI);
      rows.push({ text: split.name(client.name), style: "textName" });
      rows.push(client.email);
      rows.push({ text: client.sexo, style: "center" });
      rows.push(client.address);
      rows.push(client.tel);
      rows.push({ text: client.status, style: statusClasse });
      rows.push(new Date(client.createdAt).toLocaleDateString());
      body.push(rows);
    }

    const inlineFilters = {
      status: status === "all" ? "todos" : status,
    };
    const docDefinitions: TDocumentDefinitions = {
      pageSize: "A3",
      pageOrientation: "landscape",
      defaultStyle: { font: "Helvetica" },
      content: [
        {
          columns: [
            { text: "Relatório Clientes\n\n\t\t", style: "header" },
            {
              text: `Relatório dos clientes com o status ${inlineFilters.status}`,
              style: "filters",
            },
          ],
        },
        {
          table: {
            body: [
              [
                { text: "ID", style: "columnsTitle" },
                { text: "Número de BI", style: "columnsTitle" },
                { text: "Nome", style: "columnsName" },
                { text: "E-mail", style: "columnsTitle" },
                { text: "Sexo", style: "columnsTitle" },
                { text: "Endereço", style: "columnsTitle" },
                { text: "Telefone", style: "columnsTitle" },
                { text: "Status", style: "columnsTitle" },
                { text: "CreatedAt", style: "columnsTitle" },
              ],
              ...body,
            ],
          },
        },
      ],
      styles: {
        textName: {
          noWrap: false,
        },
        center: {
          alignment: "center",
        },
        columnsName: {
          fontSize: 12,
          bold: false,
          color: "#666666",
          alignment: "left",
        },
        header: {
          fontSize: 14,
          bold: true,
          alignment: "center",
        },
        filters: {
          fontSize: 12,
          bold: false,
          alignment: "left",
        },
        statusOn: {
          fontSize: 12,
          bold: false,
          color: "#4caf50",
          alignment: "left",
        },
        statusOff: {
          fontSize: 12,
          bold: false,
          color: "#ff5722",
          alignment: "left",
        },
        columnsTitle: {
          fontSize: 12,
          bold: false,
          color: "#666666",
          alignment: "left",
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinitions);
    pdfDoc.pipe(fs.createWriteStream("Relatório.pdf"));
    const chunks = new Array();

    pdfDoc.on("data", (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.end();

    return pdfDoc.on("end", () => {
      return Buffer.concat(chunks);
    });
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

    const body = new Array();

    for await (let driver of drivers) {
      const rows = new Array();
      const statusClasse = driver.status === "Off" ? "statusOff" : "statusOn";
      rows.push(driver.id);
      rows.push(driver.numberBI);
      rows.push({ text: split.name(driver.name), style: "textName" });
      rows.push(driver.email);
      rows.push({ text: driver.sexo, style: "center" });
      rows.push({ text: driver.status, style: statusClasse });
      rows.push(split.matricula(driver.veiculo?.matricula ?? ""));
      rows.push(driver.tel);
      rows.push(new Date(driver.createdAt).toLocaleDateString());
      body.push(rows);
    }

    const docDefinitions: TDocumentDefinitions = {
      pageSize: "A3",
      pageOrientation: "landscape",
      defaultStyle: { font: "Helvetica" },
      content: [
        {
          columns: [
            { text: "Relatório dos Motoristas\n\n\t\t", style: "header" },
            {
              text: `Relatório dos motoristas com o status`,
              style: "filters",
            },
          ],
        },
        {
          table: {
            body: [
              [
                { text: "ID", style: "columnsTitle" },
                { text: "Número de BI", style: "columnsTitle" },
                { text: "Nome", style: "columnsTitle" },
                { text: "E-mail", style: "columnsTitle" },
                { text: "Sexo", style: "columnsTitle" },
                { text: "Status", style: "columnsTitle" },
                { text: "Matricula", style: "columnsTitle" },
                { text: "Telefone", style: "columnsTitle" },
                { text: "CreatedAt", style: "columnsTitle" },
              ],
              ...body,
            ],
          },
        },
      ],
      styles: {
        textName: {
          noWrap: false,
        },
        center: {
          alignment: "center",
        },
        header: {
          fontSize: 14,
          bold: true,
          alignment: "center",
        },
        filters: {
          fontSize: 12,
          bold: false,
          alignment: "left",
        },
        statusOn: {
          fontSize: 12,
          bold: false,
          color: "#4caf50",
          alignment: "left",
        },
        statusOff: {
          fontSize: 12,
          bold: false,
          color: "#ff5722",
          alignment: "left",
        },
        columnsTitle: {
          fontSize: 12,
          bold: false,
          color: "#666666",
          alignment: "left",
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinitions);
    pdfDoc.pipe(fs.createWriteStream("Relatório.pdf"));
    const guardado = new Array();

    pdfDoc.on("data", (data: any) => {
      guardado.push(data);
    });
    pdfDoc.end();

    return pdfDoc.on("end", () => {
      return Buffer.concat(guardado);
    });
  }
}
