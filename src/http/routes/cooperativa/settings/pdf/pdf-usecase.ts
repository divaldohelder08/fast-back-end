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
    console.log(filters, "oladfsdf");
    if (!recolhas[0]) throw new Error("Nenhum registro encontrado");
    const body = new Array();

    for await (let recolha of recolhas) {
      const rows = new Array();
      rows.push({ text: split.id(recolha.id), style: "textName" });
      rows.push(`${split.name(recolha.client?.name ?? "")}`);
      rows.push(`${split.name(recolha.driver?.name ?? "")}`);
      rows.push({ text: recolha.status });
      rows.push({ text: recolha?.distance ?? "Não informado" });
      rows.push({ text: recolha?.duration ?? "Não informado" });
      rows.push({ text: recolha?.filial.name });
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
                { text: "Filial", style: "textName" },
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
          noWrap: true,
          fontSize: 12,
          bold: false,
          color: "#666666",
          alignment: "left",
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinitions);
    pdfDoc.pipe(fs.createWriteStream("Relatório-coo.pdf"));
    const guardado = new Array();

    pdfDoc.on("data", (data: any) => {
      guardado.push(data);
    });
    pdfDoc.end();

    pdfDoc.on("end", () => {
      return Buffer.concat(guardado);
    });
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

    console.log(filters);
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
    if (!clients[0]) throw new Error("Nenhum registro encontrado");

    const body = new Array();
    for await (let client of clients) {
      const rows = new Array();
      const statusClasse = client.status === "npago" ? "statusOff" : "statusOn";
      rows.push({ text: split.id(client.id), style: "textName" });
      rows.push(client.numberBI);
      rows.push({ text: split.name(client.name), style: "textName" });
      rows.push(client.email);
      rows.push(client.address);
      rows.push(client.tel);
      rows.push({ text: client.status, style: statusClasse });
      rows.push({ text: client?.filial.name });
      rows.push(new Date(client.createdAt).toLocaleDateString());
      body.push(rows);
    }
    console.log(body);
    const docDefinitions: TDocumentDefinitions = {
      pageSize: "A3",
      pageOrientation: "landscape",
      defaultStyle: { font: "Helvetica" },
      footer: function (currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + " de " + pageCount,
            style: "footer",
          },
        ];
      },
      content: [
        {
          marginTop: 20,
          svg: '<svg width="32" height="24" viewBox="0 0 56 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.75 48L7.62939e-06 0H55.5L27.75 48Z" fill="#22C55E"/></svg>',
        },
        {
          columns: [{ text: "Relatório Clientes", style: "header" }],
          marginBottom: 25,
        },
        {
          table: {
            heights: 14,
            body: [
              [
                { text: "ID", style: "columnsTitle" },
                { text: "Número de BI", style: "columnsTitle" },
                { text: "Nome", style: "columnsName" },
                { text: "E-mail", style: "columnsTitle" },
                { text: "Endereço", style: "columnsTitle" },
                { text: "Telefone", style: "columnsTitle" },
                { text: "Status", style: "columnsTitle" },
                { text: "Filial", style: "columnsTitle" },
                { text: "CreatedAt", style: "columnsTitle" },
              ],
              ...body,
            ],
          },
        },
      ],
      styles: {
        footer: {
          marginLeft: 40,
        },
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
    pdfDoc.pipe(fs.createWriteStream("Relatório-coo.pdf"));
    const chunks = new Array();

    pdfDoc.on("data", (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.end();

    return pdfDoc.on("end", () => {
      return Buffer.concat(chunks);
    });
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
    console.log(filters);

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
      filialId && rows.push({ text: driver.filial.name });
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
                filialId && { text: "Filial", style: "columnsTitle" },
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
    pdfDoc.pipe(fs.createWriteStream("Relatório-coo.pdf"));
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
