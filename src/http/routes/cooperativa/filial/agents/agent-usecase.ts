import { db } from "../../../../../db/connection";
import { prisma } from "../../../../../utils/prisma-throws";
import type { agentProps } from "../../agents/agent";

export class AgentUseCase {
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
  async findById(id: string) {
    const agent = await db.agents.findFirst({
      where: {
        id: id,
      },
    });
    if (!agent) throw new Error("Agent não encontrado!");

    return agent;
  }
  async delete({
    key,
    agentId,
    id,
  }: {
    agentId: string;
    key: string;
    id: string;
  }) {
    await prisma.manager.autorize({
      id,
      password: key,
    });
    await prisma.agents.find(agentId);
    await db.agents.delete({
      where: {
        id: agentId,
      },
    });
  }
}
