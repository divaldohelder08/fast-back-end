import dayjs from "dayjs";
import { Prisma, db } from "../../../../db/connection";
import axios from "axios";
import type { $Enums } from "@prisma/client";

const API_URL = "https://atlas.microsoft.com/route/directions/json";

export class RecolhaUseCase {
  async find(id: string) {
    return await db.recolha.findMany({
      where: {
        driverId: id,
        status: {
          notIn: ["cancelada", "finalizada"],
        },
        client: {
          status: {
            not: "npago",
          },
        },
        createdAt: {
          gte: dayjs().startOf("day").toDate(),
        },
      },
      select: {
        id: true,
        status: true,
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            coordenadas: true,
            address: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async handleAndamento({
    id,
    lat,
    lgn,
  }: {
    id: string;
    lat: number;
    lgn: number;
  }) {
    try {
      const ifExist = await this.findRecolha(id);
      const response = await this.getDirections(lat, lgn, ifExist);
      return await this.updateRecolha(id, response);
    } catch (error) {
      throw new Error(`Erro ao manipular andamento: ${error}`);
    }
  }

  async handleCancel(id: string) {
    const ifExist = await db.recolha.findFirst({
      where: { id, status: { in: ["andamento", "pendente"] } },
    });
    if (!ifExist) throw new Error("Recolha não encontrada");
    await db.recolha.update({
      where: {
        id,
      },
      data: {
        status: "cancelada",
      },
    });
  }

  async handleFinalizar(id: string) {
    const ifExist = await db.recolha.findFirst({
      where: { id, status: "andamento" },
    });
    if (!ifExist) throw new Error("Recolha não encontrada");
    await db.recolha.update({
      where: {
        id,
      },
      data: {
        status: "finalizada",
      },
    });
  }
  async findRecolha(id: string) {
    const ifExist = await db.recolha.findFirst({
      where: { id, status: "pendente" },
      select: {
        client: {
          select: {
            coordenadas: true,
          },
        },
      },
    });
    if (!ifExist) throw new Error("Recolha não encontrada");
    return ifExist;
  }
  async getDirections(lat: number, lgn: number, ifExist: any) {
    const response = await axios.get(API_URL, {
      params: {
        "api-version": "1.0",
        "subscription-key": process.env.AZURE_SECRET_KEY,
        query: `${lat},${lgn}:${ifExist.client.coordenadas[1]},${ifExist.client.coordenadas[0]}`,
        routeRepresentation: "polyline",
        travelMode: "car",
      },
    });
    return response;
  }
  async updateRecolha(id: string, response: any) {
    const { data } = response;
    return await db.recolha.update({
      where: {
        id,
      },
      data: {
        distance: String(data.routes[0].summary.lengthInMeters),
        directions: JSON.stringify(data.routes[0].legs[0].points),
        duration: `${Math.floor(data.routes[0].summary.travelTimeInSeconds / 60)} minutes`,
        status: "andamento",
      },
      select: {
        id: true,
        status: true,
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            coordenadas: true,
            address: true,
          },
        },
        createdAt: true,
      },
    });
  }
  async validate({
    status,
    id,
  }: {
    status: Prisma.EnumStatusFilter<"Recolha"> | $Enums.Status;
    id: string;
  }) {
    const recolha = await db.recolha.findUnique({
      where: {
        status,
        id,
      },
    });
    if (!recolha) throw new Error("Recolha não encontrada");
    return;
  }
}
