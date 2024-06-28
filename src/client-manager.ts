import type { ServerWebSocket } from "bun";
import chalk from "chalk";
import { nanoid } from "nanoid";
import { logger } from "./logging";

interface ClientMetadata {
    id: string;
    lastUpdate: number;
}

/**
 * The ClientManager class manages the clients connected to the server.
 */
export class ClientManager {
    private clients: Map<ServerWebSocket<unknown>, ClientMetadata>;

    /**
     * Constructs a new ClientManager instance.
     */
    constructor() {
        this.clients = new Map();
    }

    /**
     * Adds a new client to the manager.
     * @param {ServerWebSocket<unknown>} ws - The WebSocket of the client.
     */
    addClient(ws: ServerWebSocket<unknown>): void {
        const clientId = this.generateId();
        this.clients.set(ws, { id: clientId, lastUpdate: 0 });
        logger.info`Client connected: ${chalk.green(clientId)}`;
    }

    /**
     * Removes a client from the manager.
     * @param {ServerWebSocket<unknown>} ws - The WebSocket of the client.
     */
    removeClient(ws: ServerWebSocket<unknown>): void {
        const client = this.clients.get(ws);
        if (client) {
            logger.info`Client disconnected: ${chalk.red(client.id)}`;
            this.clients.delete(ws);
        }
    }

    /**
     * Gets the metadata of a client.
     * @param {ServerWebSocket<unknown>} ws - The WebSocket of the client.
     * @returns {ClientMetadata | undefined} The metadata of the client, or undefined if the client is not found.
     */
    getClient(ws: ServerWebSocket<unknown>): ClientMetadata | undefined {
        return this.clients.get(ws);
    }

    /**
     * Updates the timestamp of a client.
     * @param {ServerWebSocket<unknown>} ws - The WebSocket of the client.
     */
    updateClientTimestamp(ws: ServerWebSocket<unknown>): void {
        const client = this.clients.get(ws);
        if (client) {
            client.lastUpdate = Date.now();
        }
    }

    /**
     * Broadcasts a message to all clients.
     * @param {string} message - The message to broadcast.
     */
    broadcastMessage(message: string): void {
        for (const client of this.clients.keys()) {
            client.send(message);
        }
    }

    /**
     * Generates a unique ID for a client.
     * @returns {string} The generated ID.
     * @private
     */
    private generateId(): string {
        return nanoid();
    }
}
