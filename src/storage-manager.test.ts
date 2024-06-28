// storage-manager.test.ts
import { beforeEach, describe, expect, jest, test } from "bun:test";
import type { Canvas } from "./canvas";
import { Config } from "./config";
import { StorageManager } from "./storage-manager";

describe("StorageManager", () => {
    let storageManager: StorageManager;
    let mockCanvas: Canvas;

    beforeEach(() => {
        const config = new Config();
        mockCanvas = {
            getChunk: jest.fn().mockReturnValue(new Uint8ClampedArray(100)),
        } as unknown as Canvas;
        storageManager = new StorageManager(config, mockCanvas);
    });

    test("should read chunk from disk", async () => {
        const result = await storageManager.readChunkFromDisk(0, 0);
        expect(result).toBeNull(); // Assuming the default implementation returns null
    });

    test("should write chunk to disk", async () => {
        const chunk = new Uint8ClampedArray(100);
        await expect(
            storageManager.writeChunkToDisk(0, 0, chunk),
        ).resolves.toBeUndefined();
    });
});
