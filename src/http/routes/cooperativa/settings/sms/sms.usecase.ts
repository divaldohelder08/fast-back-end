import puppeteer from "puppeteer";
import { db } from "../../../../../db/connection";
import { resend } from "../../../../../lib/resend";
import type { SmsProps } from "./sms";

class SmSUseCase {
  async send({ message, target }: SmsProps) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    switch (target) {
      case "drivers":
        const drivers = await this.sendToDrivers();
        console.log("Conectado com sucesso")

        for (const e of drivers) {
          await page.goto(`https://web.whatsapp.com/send?phone=${e.tel}&text=${message}`);
          await page.click('span[data-icon="send"]');
          console.log("vgcf")
          // await page.waitForSelector('span[data-icon="send"]');
        }
        console.log("Messagens enviadas com sucesso")
        break;
      case "clients":
        return await this.sendToClients();
      case "agents":
        return await this.sendToAgents();
      case "managers":
        return await this.sendToManagers();
      default:
        throw new Error("Target not found");
    }
  }
  async sendToDrivers() {
    return await db.driver.findMany();
  }
  async sendToClients() {
    return await db.client.findMany();
  }
  async sendToAgents() {
    return await db.agents.findMany();
  }
  async sendToManagers() {
    return await db.manager.findMany();
  }
}


export const  smSUseCase = new SmSUseCase();
    