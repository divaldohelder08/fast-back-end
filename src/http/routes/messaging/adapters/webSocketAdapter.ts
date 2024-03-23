import { FastifyInstance } from "fastify";
import type { webSocketProtocol } from "../protocoles/websocket";
import { AuthManager, Execute } from "../../../middleware";

export class WebSocketAdapter implements webSocketProtocol {
  private fastify: FastifyInstance;
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }
  handleConnection(connection: any): void {
    connection.socket.on("message", (message: any) => {
      try {
        const payload = this.parseMessage(message);
        if (payload.action === "auth") {
          await this.handleAuthentication(payload, connection);
        } else {
        }
      } catch (error) {
        this.handleError(error, connection);
      }
    });
  }
  private parseMessage(message: any) {
    try {
      return JSON.parse(message.toString());
    } catch (error) {
      return null;
    }
  }
  private handleError(error: any, connection: any) {
    console.error("Error processing message", error);
    connection.socket.send("Error processing message");
  }
  private async handleAuthentication(payload: any, connection: any) {
    if (payload?.token) {
      connection.socket.send("Token not found");
      return;
    }
    const data = await Execute({
      headers: { authorization: payload.token },
    });
    if (data?.id) {
      connection.socket.userId = data.id;
      connection.socket.filialId = data.filialId;
      connection.socket.authenticated = true;
      connection.socket.send("Authenticated");
      return;
    }
    connection.socket.send("Invalid token");
  }
}
