import dayjs from "dayjs";
import type {
  clientByIdProps,
  decodedUserFilialIdProps,
  geoMapFilter,
} from "../../../../../index-types";
import { db } from "../../../../db/connection";

interface decodedUserProps {
  id: string;
  filialId: string;
}


interface deleteClientProps extends decodedUserProps {
  clintId: string;
  key: string;
}

export class ClientUseCase {
  async find({ filialId }: decodedUserProps) {
    return await db.client.findMany({
      where: {
        filialId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        numberBI: true,
        nascimento: true,
        createdAt: true,
      },
    });
  }
  async delete({ id, key, clintId, filialId }: deleteClientProps) {
    if (
      !(await db.manager.findUnique({
        where: {
          id,
          password: key,
        },
      }))
    ) {
      throw Error("Chave do manager incorreta");
    }

    if (
      !(await db.client.findUnique({
        where: {
          id: clintId,
          filialId,
        },
      }))
    ) {
      throw Error("Cliente não encontrado");
    }

    await db.client.delete({
      where: {
        id: clintId,
        filialId,
      },
    });
  }
  async findById({ id, filialId }: clientByIdProps) {
    if (!(await db.client.findUnique({ where: { id, filialId } }))) {
      throw new Error("Cliente não encontrado!");
    }

    const heatData = await db.recolha.groupBy({
      by: ["createdAt"],
      where: {
        clientId: id,
        status: {
          in: ["finalizada", "cancelada"],
        },
      },
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      client: await db.client.findUnique({
        where: {
          id,
          filialId,
        },
        select: {
          avatar: true,
          name: true,
          email: true,
          createdAt: true,
          tel: true,
          filial: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              recolhas: true,
            },
          },
        },
      }),
      heatMap: heatData.map((e) => {
        return {
          date: dayjs(e.createdAt).format("YYYY/MM/DD"),
          count: e._count,
        };
      }),
    };
  }
  async geoMap({ filialId, numberBI }: geoMapFilter) {
    return await db.client.findMany({
      select: {
        id:true,
        numberBI: true,
        name: true,
        coordenadas: true,
      },
      where: {
        filialId,
        numberBI:{
          contains:numberBI
        }
      },
    });
  }
}
