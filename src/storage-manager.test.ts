// storage-manager.test.ts
import { beforeEach, describe, expect, jest, test } from "bun:test";
import type { Canvas } from "./canvas";
import { Config } from "./config";
import { StorageManager } from "./storage-manager";

describe("StorageManager", () => {
    let storageManager: StorageManager;
    let mockCanvas: Canvas;

    beforeEach(() => {
        const config = new Config({
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
            getChunk: jest.fn().mockReturnValue(new Uint8ClampedArray(100)),
        } as unknown as Canvas;
        storageManager = new StorageManager(config, mockCanvas);
    });

    test("should read chunk from disk", () => {
        expect(storageManager.readChunkFromDisk(0, 0)).rejects.toThrowError(
            "Reading invididual chunks from disk is not implemented",
        );
    });

    test("should write chunk to disk", () => {
        const chunk = new Uint8ClampedArray(100);
        expect(
            storageManager.writeChunkToDisk(0, 0, chunk),
        ).rejects.toThrowError(
            "Writing invididual chunks to disk is not implemented",
        );
    });
});
