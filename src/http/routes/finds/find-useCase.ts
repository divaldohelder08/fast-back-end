import { db } from "../../../db/connection";

export class FindUseCase {
  async filias() {
    return db.filial.findMany({ select: { id: true, name: true } });
  }
  async findName({id} : {id: string}) {
    return db.filial.findFirst({
      select: { name: true },
      where: {
        id,
      },
    });
  }
  async drivers() {
    return db.driver.findMany(
    /*{ select: { id: true, name: true } }  */
    );
  }
  async clients() {
    return await db.client.findMany();
  }

  async managers() {
    return await db.manager.findMany();
  }
  async recolha() {
    return await db.recolha.findMany();
  }

  async agents() {
    return await db.agents.findMany();
  }
}
