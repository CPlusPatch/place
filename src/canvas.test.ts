// canvas.test.ts
import { beforeEach, describe, expect, test } from "bun:test";
import { Canvas, type Rgb } from "./canvas";
import { Config } from "./config";

describe("Canvas", () => {
    const config = new Config({
        canvas: {
            chunks: {
                size: 7,
            },
            size: {
                height: 10,
                width: 10,
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
    let canvas: Canvas;

    beforeEach(() => {
        canvas = new Canvas(config);
    });

    test("should set and get a pixel correctly", () => {
        const color: Rgb = [255, 0, 0];
        canvas.setPixel(5, 5, color);
        expect(canvas.getPixel(5, 5)).toEqual(color);
    });

    test("should get a chunk correctly", () => {
        const color1: Rgb = [255, 0, 0];
        const color2: Rgb = [0, 255, 0];
        canvas.setPixel(0, 0, color1);
        canvas.setPixel(4, 4, color2);

        const chunk = canvas.getChunk(0, 0);
        expect(chunk.length).toBe(7 * 7 * 3);
        expect(chunk.slice(0, 3)).toEqual(new Uint8ClampedArray(color1));
        // 7 is the chunk size, 4 is the x and y position of the second pixel
        expect(chunk.slice((4 * 7 + 4) * 3, (4 * 7 + 4) * 3 + 3)).toEqual(
            new Uint8ClampedArray(color2),
        );
    });

    test("should handle chunks not fitting in the canvas", () => {
        const color: Rgb = [255, 0, 0];
        canvas.setPixel(0, 0, color);
        const chunk = canvas.getChunk(1, 1);
        expect(chunk.length).toBe(7 * 7 * 3);
        expect(chunk.slice(0, 3)).toEqual(new Uint8ClampedArray([0, 0, 0]));
    });
});
