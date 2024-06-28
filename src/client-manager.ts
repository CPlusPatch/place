import type { ServerWebSocket } from "bun";
import { logger } from "./logging";
import chalk from "chalk";

interface ClientMetadata {
    id: string;
    lastUpdate: number;
}

export class ClientManager {
    private clients: Map<ServerWebSocket<unknown>, ClientMetadata>;

    constructor() {
        this.clients = new Map();
    }

    addClient(ws: ServerWebSocket<unknown>): void {
        const clientId = this.generateId();
        this.clients.set(ws, { id: clientId, lastUpdate: 0 });
        logger.info`Client connected: ${chalk.green(clientId)}`;
    }

    removeClient(ws: ServerWebSocket<unknown>): void {
        const client = this.clients.get(ws);
        if (client) {
            logger.info`Client disconnected: ${chalk.red(client.id)}`;
            this.clients.delete(ws);
        }
    }

    getClient(ws: ServerWebSocket<unknown>): ClientMetadata | undefined {
        return this.clients.get(ws);
    }

    updateClientTimestamp(ws: ServerWebSocket<unknown>): void {
        const client = this.clients.get(ws);
        if (client) {
            client.lastUpdate = Date.now();
        }
    }

    broadcastMessage(message: string): void {
        for (const client of this.clients.keys()) {
            client.send(message);
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}
