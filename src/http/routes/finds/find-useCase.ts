import { db } from "../../../db/connection"

export class FindUseCase {
  async filias() {
    return db.filial.findMany({ select: { id: true, name: true } })
  }
  async drivers() {
    return db.driver.findMany({ select: { id: true, name: true } })
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
}