import type { ServerWebSocket } from "bun";
import { z } from "zod";
import type { Canvas } from "./canvas";
import type { ClientManager } from "./client-manager";
import type { Config } from "./config";
import type { StorageManager } from "./storage-manager";
import { logger } from "./logging";
import chalk from "chalk";
import { fromZodError } from "zod-validation-error";

// Define Zod schemas
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

const MessageSchema = z.union([PixelUpdateSchema, ChunkRequestSchema]);

type PixelUpdate = z.infer<typeof PixelUpdateSchema>;
type ChunkRequest = z.infer<typeof ChunkRequestSchema>;

export class MessageHandler {
    private config: Config;
    private canvas: Canvas;
    private clientManager: ClientManager;
    private storageManager: StorageManager;

    constructor(
        config: Config,
        canvas: Canvas,
        clientManager: ClientManager,
        storageManager: StorageManager,
    ) {
        this.config = config;
        this.canvas = canvas;
        this.clientManager = clientManager;
        this.storageManager = storageManager;
    }

    async handleMessage(
        ws: ServerWebSocket<unknown>,
        message: string | Buffer,
    ): Promise<void> {
        try {
            const data = JSON.parse(Buffer.from(message).toString("utf-8"));
            const validatedMessage = MessageSchema.parse(data);

            switch (validatedMessage.type) {
                case "pixelUpdate":
                    await this.handlePixelUpdate(ws, validatedMessage);
                    break;
                case "getChunk":
                    await this.handleChunkRequest(ws, validatedMessage);
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

    private async handlePixelUpdate(
        ws: ServerWebSocket<unknown>,
        update: PixelUpdate,
    ): Promise<void> {
        const client = this.clientManager.getClient(ws);
        if (!client) {
            return;
        }

        const now = Date.now();
        if (now - client.lastUpdate < this.config.cooldownPeriod) {
            return;
        }

        this.canvas.setPixel(update.x, update.y, update.color);
        this.clientManager.updateClientTimestamp(ws);

        // Broadcast update to all clients
        const updateMessage = JSON.stringify(update);
        this.clientManager.broadcastMessage(updateMessage);

        // Write updated chunk to disk
        const chunkX = Math.floor(update.x / this.config.chunkSize);
        const chunkY = Math.floor(update.y / this.config.chunkSize);
        await this.storageManager.writeChunkToDisk(
            chunkX,
            chunkY,
            this.canvas.getChunk(chunkX, chunkY),
        );
    }

    private async handleChunkRequest(
        ws: ServerWebSocket<unknown>,
        request: ChunkRequest,
    ): Promise<void> {
        let chunkData = await this.storageManager.readChunkFromDisk(
            request.x,
            request.y,
        );
        if (!chunkData) {
            chunkData = this.canvas.getChunk(request.x, request.y);
            await this.storageManager.writeChunkToDisk(
                request.x,
                request.y,
                chunkData,
            );
        }
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
