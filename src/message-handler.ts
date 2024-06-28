import type { ServerWebSocket } from "bun";
import chalk from "chalk";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Canvas } from "./canvas";
import type { ClientManager } from "./client-manager";
import type { Config } from "./config";
import { logger } from "./logging";
import type { StorageManager } from "./storage-manager";

const RgbSchema = z.tuple([
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255),
]);

const PixelUpdateSchema = z.object({
    type: z.literal("pixelUpdate"),
    x: z.number().int(),
    y: z.number().int(),
    color: RgbSchema,
});

const ChunkRequestSchema = z.object({
    type: z.literal("getChunk"),
    x: z.number().int(),
    y: z.number().int(),
});

const MetadataRequestSchema = z.object({
    type: z.literal("getMetadata"),
});

const MessageSchema = z.union([
    PixelUpdateSchema,
    ChunkRequestSchema,
    MetadataRequestSchema,
]);

type PixelUpdate = z.infer<typeof PixelUpdateSchema>;
type ChunkRequest = z.infer<typeof ChunkRequestSchema>;

/**
 * The MessageHandler class handles incoming messages from clients.
 */
export class MessageHandler {
    /**
     * Constructs a new MessageHandler instance.
     * @param {Config} config - The configuration object for the server.
     * @param {Canvas} canvas - The canvas object to manipulate.
     * @param {ClientManager} clientManager - The client manager to manage clients.
     * @param {StorageManager} storageManager - The storage manager to manage storage.
     */
    constructor(
        private config: Config,
        private canvas: Canvas,
        private clientManager: ClientManager,
        private storageManager: StorageManager,
    ) {}

    /**
     * Handles an incoming message from a client.
     * @param {ServerWebSocket<unknown>} ws - The WebSocket of the client.
     * @param {string | Buffer} message - The incoming message.
     * @returns {Promise<void>}
     */
    handleMessage(
        ws: ServerWebSocket<unknown>,
        message: string | Buffer,
    ): void {
        try {
            const data = JSON.parse(Buffer.from(message).toString("utf-8"));
            const validatedMessage = MessageSchema.parse(data);

            switch (validatedMessage.type) {
                case "pixelUpdate":
                    this.handlePixelUpdate(ws, validatedMessage);
                    break;
                case "getChunk":
                    this.handleChunkRequest(ws, validatedMessage);
                    break;
                case "getMetadata":
                    this.handleMetadataRequest(ws);
                    break;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedError = fromZodError(error);

                logger.warn`Received invalid message: ${chalk.yellow(
                    formattedError.message,
                )}`;
            } else {
                logger.error`Error processing message: ${chalk.red(error)}`;
            }
        }
    }

    /**
     * Handles a pixel update message from a client.
     * @param {ServerWebSocket<unknown>} ws - The WebSocket of the client.
     * @param {PixelUpdate} update - The pixel update message.
     * @returns {Promise<void>}
     * @private
     */
    private handlePixelUpdate(
        ws: ServerWebSocket<unknown>,
        update: PixelUpdate,
    ): void {
        const client = this.clientManager.getClient(ws);
        if (!client) {
            return;
        }

        const now = Date.now();
        if (now - client.lastUpdate < this.config.config.ratelimits.cooldown) {
            return;
        }

        this.canvas.setPixel(update.x, update.y, update.color);
        this.clientManager.updateClientTimestamp(ws);

        // Broadcast update to all clients
        const updateMessage = JSON.stringify(update);
        this.clientManager.broadcastMessage(updateMessage);

        // Write updated chunk to disk
        const chunkX = Math.floor(
            update.x / this.config.config.canvas.chunks.size,
        );
        const chunkY = Math.floor(
            update.y / this.config.config.canvas.chunks.size,
        );
        this.storageManager.markChunkAsModified(
            chunkX,
            chunkY,
            this.canvas.getChunk(chunkX, chunkY),
        );
    }

    /**
     * Handles a metadata request message from a client.
     * @param {ServerWebSocket<unknown>} ws - The WebSocket of the client.
     * @returns {void}
     * @private
     */
    private handleMetadataRequest(ws: ServerWebSocket<unknown>): void {
        ws.send(
            JSON.stringify({
                type: "metadata",
                canvas: {
                    width: this.config.config.canvas.size.width,
                    height: this.config.config.canvas.size.height,
                },
                chunks: {
                    size: this.config.config.canvas.chunks.size,
                },
                ratelimits: {
                    cooldown: this.config.config.ratelimits.cooldown,
                },
            }),
        );
    }

    /**
     * Handles a chunk request message from a client.
     * @param {ServerWebSocket<unknown>} ws - The WebSocket of the client.
     * @param {ChunkRequest} request - The chunk request message.
     * @returns {Promise<void>}
     * @private
     */
    private handleChunkRequest(
        ws: ServerWebSocket<unknown>,
        request: ChunkRequest,
    ): void {
        const chunkData = this.canvas.getChunk(request.x, request.y);

        ws.send(
            JSON.stringify({
                type: "chunk",
                x: request.x,
                y: request.y,
                data: Array.from(chunkData),
            }),
        );
    }
}
