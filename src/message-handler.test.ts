// message-handler.test.ts
import { beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import type { ServerWebSocket } from "bun";
import type { Canvas } from "./canvas";
import type { ClientManager } from "./client-manager";
import { Config } from "./config";
import { logger } from "./logging";
import { MessageHandler } from "./message-handler";
import type { StorageManager } from "./storage-manager";

describe("MessageHandler", () => {
    let messageHandler: MessageHandler;
    let mockConfig: Config;
    let mockCanvas: Canvas;
    let mockClientManager: ClientManager;
    let mockStorageManager: StorageManager;
    let mockWs: ServerWebSocket<unknown>;

    beforeEach(() => {
        mockConfig = new Config({
            canvas: {
                size: {
                    width: 100,
                    height: 100,
                },
                chunks: {
                    size: 10,
                },
            },
            ratelimits: {
                cooldown: 10 * 60 * 1000,
            },
            websockets: {
                host: "localhost",
                port: 8080,
            },
            disk: {
                interval: 5000,
                path: "data/map.bin",
            },
            logging: {
                level: "info",
            },
        });
        mockCanvas = {
            setPixel: jest.fn(),
            getChunk: jest.fn().mockReturnValue(new Uint8ClampedArray(100)),
        } as unknown as Canvas;
        mockClientManager = {
            getClient: jest.fn().mockReturnValue({ lastUpdate: 0 }),
            updateClientTimestamp: jest.fn(),
            broadcastMessage: jest.fn(),
        } as unknown as ClientManager;
        mockStorageManager = {
            readChunkFromDisk: jest.fn().mockResolvedValue(null),
            writeChunkToDisk: jest.fn().mockResolvedValue(undefined),
        } as unknown as StorageManager;
        mockWs = {
            send: jest.fn(),
        } as unknown as ServerWebSocket<unknown>;

        messageHandler = new MessageHandler(
            mockConfig,
            mockCanvas,
            mockClientManager,
            mockStorageManager,
        );
    });

    test("should handle valid pixel update", () => {
        const message = JSON.stringify({
            type: "pixelUpdate",
            x: 5,
            y: 5,
            color: [255, 0, 0],
        });

        messageHandler.handleMessage(mockWs, message);

        expect(mockCanvas.setPixel).toHaveBeenCalledWith(5, 5, [255, 0, 0]);
        expect(mockClientManager.updateClientTimestamp).toHaveBeenCalledWith(
            mockWs,
        );
        expect(mockClientManager.broadcastMessage).toHaveBeenCalled();
    });

    test("should handle valid chunk request", async () => {
        const message = JSON.stringify({
            type: "getChunk",
            x: 0,
            y: 0,
        });

        await messageHandler.handleMessage(mockWs, message);

        expect(mockCanvas.getChunk).toHaveBeenCalledWith(0, 0);
        expect(mockWs.send).toHaveBeenCalled();
    });

    test("should handle valid metadata request", async () => {
        const message = JSON.stringify({
            type: "getMetadata",
        });

        await messageHandler.handleMessage(mockWs, message);

        expect(mockWs.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: "metadata",
                canvas: {
                    width: 100,
                    height: 100,
                },
                chunks: {
                    size: 10,
                },
                ratelimits: {
                    cooldown: 10 * 60 * 1000,
                },
            }),
        );
    });

    test("should reject invalid message", async () => {
        const consoleWarnSpy = spyOn(logger, "warn").mockImplementation(() => {
            // ...
        });
        const message = JSON.stringify({
            type: "invalidType",
        });

        await messageHandler.handleMessage(mockWs, message);

        expect(consoleWarnSpy).toHaveBeenCalled();
        consoleWarnSpy.mockRestore();
    });
});
