import type {
  clientByIdProps,
  decodedUserFilialIdProps,
  deleteAgentProps,
} from "../../../../../index-types";
import { db } from "../../../../db/connection";
import type { agentProps } from "./agent";

interface agentData extends agentProps {
  filialId: string;
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
      },
    });
  }
  async delete({ id, key, agentId, filialId }: deleteAgentProps) {
    if (
      !(await db.manager.findUnique({
        where: {
          id,
          password: key,
        },
      }))
    ) {
      throw Error("Senha incorreta");
    }

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
  async create({ email, name, sexo, filialId }: agentData) {
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
      },
    });
  }
}
