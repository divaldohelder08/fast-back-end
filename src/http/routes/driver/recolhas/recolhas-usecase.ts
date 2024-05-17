import dayjs from "dayjs";
import { Prisma, db } from "../../../../db/connection";
import axios from "axios";
import type { $Enums } from "@prisma/client";
import { formatSecondsToMinutes } from "../../../../utils/format-time";

const API_URL = "https://atlas.microsoft.com/route/directions/json";

export class RecolhaUseCase {
  async find(id: string) {
    return await db.recolha.findMany({
      where: {
        driverId: id,
        status: {
          notIn: ["cancelada", "andamento", "finalizada"],
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
      console.log(error, "eresdkijfvsnd")
      throw new Error("Erro ao manipular andamento");
    }
  }

  async handleCancel(id: string) {
    const ifExist = await db.recolha.findFirst({
      where: { id, status: "pendente" },
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
      timeout: 50000,
      params: {
        "api-version": "1.0",
        "subscription-key": 'dBAVV2zTFrr1RDnNU_Fice1h2gYz5CoV-Q2SZ6Y_Lws',
        query: `${lat},${lgn}:${ifExist.client.coordenadas[0]},${ifExist.client.coordenadas[1]}`,
        routeRepresentation: "polyline",
        travelMode: "car",
      },
    });

    return response;
  }
  async updateRecolha(id: string, response: any) {
    const { data } = response;
    const route = data.routes[0];

    const routeCoordinates = route.legs.flatMap((leg: { points: any[]; }) => leg.points.map(point => [point.longitude, point.latitude]));
    console.log(routeCoordinates)
    const result = await db.recolha.update({
      where: {
        id,
      },
      data: {
        distance: String(data.routes[0].summary.lengthInMeters),
        directions: routeCoordinates,
        duration: formatSecondsToMinutes(data.routes[0].summary.travelTimeInSeconds),
        status: "andamento",
      },
      select: {
        id: true,
        status: true,
        directions: true,
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
    console.log(result)
    return result
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
