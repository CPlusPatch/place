// Canvas.ts
import type { Config } from "./config";

export type Rgb = [number, number, number];

export class Canvas {
    private canvas: Uint8ClampedArray;
    private config: Config;

    constructor(config: Config) {
        this.config = config;
        this.canvas = new Uint8ClampedArray(
            config.canvasSizeX * config.canvasSizeY * 3,
        );
    }

    setPixel(x: number, y: number, color: Rgb): void {
        const index = (y * this.config.canvasSizeX + x) * 3;
        this.canvas[index] = color[0];
        this.canvas[index + 1] = color[1];
        this.canvas[index + 2] = color[2];
    }

    getChunk(x: number, y: number): Uint8ClampedArray {
        const chunkData = new Uint8ClampedArray(
            this.config.chunkSize * this.config.chunkSize * 3,
        );
        for (let i = 0; i < this.config.chunkSize; i++) {
            for (let j = 0; j < this.config.chunkSize; j++) {
                const canvasX = x * this.config.chunkSize + i;
                const canvasY = y * this.config.chunkSize + j;
                if (
                    canvasX < this.config.canvasSizeX &&
                    canvasY < this.config.canvasSizeY
                ) {
                    const canvasIndex =
                        (canvasY * this.config.canvasSizeX + canvasX) * 3;
                    const chunkIndex = (j * this.config.chunkSize + i) * 3;
                    chunkData[chunkIndex] = this.canvas[canvasIndex];
                    chunkData[chunkIndex + 1] = this.canvas[canvasIndex + 1];
                    chunkData[chunkIndex + 2] = this.canvas[canvasIndex + 2];
                }
            }
        }
        return chunkData;
    }
}
