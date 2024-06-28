// canvas.test.ts
import { expect, test, describe, beforeEach } from "bun:test";
import { Canvas, type Rgb } from "./canvas";
import { Config } from "./config";

describe("Canvas", () => {
    const config = new Config({
        canvasSizeX: 10,
        canvasSizeY: 10,
        chunkSize: 5,
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
        expect(chunk.length).toBe(5 * 5 * 3);
        expect(chunk.slice(0, 3)).toEqual(new Uint8ClampedArray(color1));
        expect(chunk.slice((4 * 5 + 4) * 3, (4 * 5 + 4) * 3 + 3)).toEqual(
            new Uint8ClampedArray(color2),
        );
    });
});
