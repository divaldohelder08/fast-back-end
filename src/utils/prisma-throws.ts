import { Prisma, db } from "../db/connection";

interface autorize {
  id: string;
  password: string;
}

interface onFilial {
  id: string;
  filialId: string;
}
class PrismaFilialValidations {
  async telError(tel: string) {
    const result = await db.filial.findUnique({
      where: {
        tel,
      },
    });
    if (result) throw new Error("Telefone já cadastrado");
  }
  async emailError(email: string) {
    const result = await db.filial.findUnique({
      where: {
        email,
      },
    });
    if (result) throw new Error("Email já cadastrado");
  }
}

export class PrismaManagerValidations {
  async findError(id: string) {
    const result = await db.manager.findUnique({
      where: {
        id,
      },
    });
    if (!result) throw Error("Gerente não encontrado!");
  }
  async findOnFilialError({ id, filialId }: { id: string, filialId?: string }) {
    const result = await db.manager.findUnique({
      where: {
        id,
        filial: {
          some: {
            id: filialId
          }
        }
      },
    });
    if (!result) throw Error("Gerente não encontrado!");
  }
  async telError(tel: string) {
    const result = await db.manager.findUnique({
      where: {
        tel,
      },
    });
    if (result) throw new Error("Telefone já cadastrado");
  }
  async emailError(email: string) {
    const result = await db.manager.findUnique({
      where: {
        email,
      },
    });
    if (result) throw new Error("Email já cadastrado");
  }
  async autorize({ id, password }: autorize) {
    const result = await db.manager.findUnique({
      where: {
        id,
        password,
      },
    });
    if (!result) throw new Error("Senha manager");
  }
}

export class PrismaClientValidations {
  async numberBIError(numberBI: string) {
    const result = await db.client.findUnique({
      where: {
        numberBI,
      },
    });

    if (result) throw new Error("Bilhete já registrado");
  }
  async emailError(email: string) {
    const result = await db.client.findUnique({
      where: {
        email,
      },
    });
    if (result) throw new Error("Email já cadastrado");
  }
  async telError(tel: string) {
    const result = await db.client.findUnique({
      where: {
        tel,
      },
    });
    if (result) throw new Error("Telefone já cadastrado");
  }
  async find(id: string) {
    const result = await db.client.findUnique({
      where: {
        id,
      },
    });
    if (!result) throw Error("Cliente não encontrado");
  }
  async findOnFilial({ id, filialId }: onFilial) {
    const result = await db.client.findUnique({
      where: {
        id,
        filialId,
      },
    });
    if (!result) throw Error("Cliente não encontrado");
  }
}
export class PrismaDriverValidations {
  async findOnFilial({ id, filialId }: onFilial) {
    const result = await db.driver.findUnique({
      where: {
        id,
        filialId,
      },
    });
    if (!result) throw Error("Motorista não encontrado");
  }
  async find(id: string) {
    const result = await db.driver.findUnique({
      where: {
        id,
      },
    });
    if (!result) throw Error("Motorista não encontrado");
  }
  async matriculaError(matricula: string) {
    const result = await db.veiculo.findUnique({
      where: {
        matricula,
      },
    });

    if (result) throw new Error("Matricula já registrada");
  }
  async numberBIError(numberBI: string) {
    const result = await db.driver.findUnique({
      where: {
        numberBI,
      },
    });

    if (result) throw new Error("Bilhete já registrado");
  }
  async emailError(email: string) {
    const result = await db.driver.findUnique({
      where: {
        email,
      },
    });
    if (result) throw new Error("Email já cadastrado");
  }
  async telError(tel: string) {
    const result = await db.driver.findUnique({
      where: {
        tel,
      },
    });
    if (result) throw new Error("Telefone já cadastrado");
  }
}

export class PrismaAgentValidations {
  async autorize({ id, password }: autorize) {
    const result = await db.agents.findUnique({
      where: {
        id,
        password,
      },
    });
    if (!result) throw new Error("Senha incorreta");
  }
  async find(id: string) {
    const result = await db.agents.findUnique({
      where: {
        id,
      },
    });
    if (!result) throw Error("Agente não encontrado!");
  }
  async emailError(email: string) {
    const result = await db.agents.findUnique({
      where: {
        email,
      },
    });
    if (result) throw new Error("Email Já cadastrado");
  }
  async findOnFilial({ id, filialId }: { id: string; filialId: string }) {
    const result = await db.agents.findUnique({
      where: {
        id,
        filialId,
      },
    });
    if (!result) throw Error("Agent não encontrado!");
  }
}

export class PrismaRecolhaValidations {
  async findError(id: string) {
    const result = await db.recolha.findUnique({
      where: {
        id,
      },
    })
    if (!result)
      throw Error("Recolha não encontrada!");

  }
}



export const prisma = {
  filial: new PrismaFilialValidations(),
  manager: new PrismaManagerValidations(),
  client: new PrismaClientValidations(),
  driver: new PrismaDriverValidations(),
  agents: new PrismaAgentValidations(),
  recolha: new PrismaRecolhaValidations()
};
