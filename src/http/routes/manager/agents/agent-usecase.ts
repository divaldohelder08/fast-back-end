import type {
  clientByIdProps,
  decodedUserFilialIdProps,
  updateStatusData
} from "../../../../../index-types";
import { db } from "../../../../db/connection";
import type { agentProps } from "./agent";

interface agentData extends agentProps {
  filialId: string;
}
interface updateStatusProps extends updateStatusData {
  filialId: string;
  id: string;
}
export interface deleteAgentProps extends decodedUserFilialIdProps {
  agentId: string;
}
export class AgentUseCase {
  async find({ filialId }: decodedUserFilialIdProps) {
    return await db.agents.findMany({
      where: {
        filialId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        avatar: true,
        tel: true,
        status: true,
      },
    });
  }
  async delete({ agentId, filialId }: deleteAgentProps) {
    // if (
    //   !(await db.manager.findUnique({
    //     where: {
    //       id,
    //       password: key,
    //     },
    //   }))
    // ) {
    //   throw Error("Senha incorreta");
    // }

    if (
      !(await db.agents.findUnique({
        where: {
          id: agentId,
          filialId,
        },
      }))
    ) {
      throw Error("Agent não encontrado!");
    }

    await db.agents.delete({
      where: {
        id: agentId,
        filialId,
      },
    });
  }
  async findById({ id, filialId }: clientByIdProps) {
    const agent = await db.agents.findFirst({
      where: {
        id: id,
        filialId,
      },
    });
    if (!agent) {
      throw new Error("Agent não encontrado!");
    }
    return agent;
  }
  async create({ email, name, sexo, filialId, tel }: agentData) {
    if (
      await db.agents.findUnique({
        where: {
          email,
        },
      })
    )
      throw new Error("Existe 1 agente já registrado com esse email");

    if (
      (await db.agents.count({
        where: {
          filialId,
        },
      })) >= 5
    )
      throw new Error("Apenas podem ser cadastrados 5 agents");
    return await db.agents.create({
      data: {
        name,
        email,
        sexo,
        filialId,
        tel
      },
    });
  }
  async updateStatus({ id, status, filialId }: updateStatusProps) {
    if (
      !(await db.agents.findFirst({
        where: {
          id,
          filialId,
        },
      }))
    )
      throw new Error("Agente não encontrado!");

    await db.agents.update({
      data: {
        status,
      },
      where: {
        id,
        filialId,
      }
    });
    return
  }
}
