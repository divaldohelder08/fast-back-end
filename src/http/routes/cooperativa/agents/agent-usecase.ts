import { db } from "../../../../db/connection";
import type { filialId } from "../../../../types";

export interface deleteAgentProps extends filialId {
  agentId: string;
}
export class AgentUseCase {
  async find() {
    return await db.agents.findMany({
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
}
