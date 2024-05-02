import { db } from "../../../../db/connection";
import type { clientByIdProps } from "../../../../types";
import { prisma } from "../../../../utils/prisma-throws";
import type { agentProps } from "./agent";

interface agentData extends agentProps {
  filialId: string;
}
interface updateStatusProps {
  status: "On" | "Off";
  filialId: string;
  id: string;
}

class AgentUseCase {
  async find(filialId: string) {
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
  async delete({
    id,
    filialId,
  }: {
    id: string;
    filialId: string;
    managerId?: string;
  }) {
    await prisma.agents.findOnFilial({
      id,
      filialId,
    });

    await db.agents.delete({
      where: {
        id,
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
    if (!agent) throw new Error("Agent não encontrado!");

    return agent;
  }
  async create({ email, name, sexo, filialId, tel }: agentData) {
    await prisma.agents.emailError(email);

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
        tel,
      },
    });
  }
  async updateStatus({ id, status, filialId }: updateStatusProps) {
    await prisma.agents.findOnFilial({ id, filialId });
    await db.agents.update({
      data: {
        status,
      },
      where: {
        id,
        filialId,
      },
    });
  }
}

export const agentUseCase = new AgentUseCase();
