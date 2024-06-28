import type { Config } from "./config";

export type Rgb = [number, number, number];

/**
 * The Canvas class represents a 2D grid of pixels, each represented by an RGB color.
 */
export class Canvas {
    private canvas: Uint8ClampedArray;

    /**
     * Constructs a new Canvas instance.
     * @param {Config} config - The configuration object for the canvas.
     */
    constructor(private config: Config) {
        this.canvas = new Uint8ClampedArray(
            config.config.canvas.size.width *
                config.config.canvas.size.height *
                3,
        );
    }

    /**
     * Gets the canvas data as a Uint8ClampedArray.
     * @returns {Uint8ClampedArray} The canvas data.
     * @example
     * const canvas = new Canvas(config);
     * const canvasData = canvas.getCanvas();
     * console.log(canvasData);
     */
    public getCanvas(): Uint8ClampedArray {
        return this.canvas;
    }

    /**
     * Sets the canvas data.
     * @param {Uint8ClampedArray} canvas - The canvas data to set.
     * @example
     * const canvas = new Canvas(config);
     * const canvasData = new Uint8ClampedArray(100);
     * canvas.setCanvas(canvasData);
     */
    public setCanvas(canvas: Uint8ClampedArray): void {
        this.canvas = canvas;
    }

    /**
     * Sets the color of a pixel at the specified coordinates.
     * @param {number} x - The x-coordinate of the pixel.
     * @param {number} y - The y-coordinate of the pixel.
     * @param {Rgb} color - The RGB color to set the pixel to.
     */
    public setPixel(x: number, y: number, color: Rgb): void {
        const index = (y * this.config.config.canvas.size.width + x) * 3;
        this.canvas[index] = color[0];
        this.canvas[index + 1] = color[1];
        this.canvas[index + 2] = color[2];
    }

    /**
     * Gets the color of a pixel at the specified coordinates.
     * @param {number} x - The x-coordinate of the pixel.
     * @param {number} y - The y-coordinate of the pixel.
     * @returns {Rgb} The RGB color of the pixel.
     */
    public getPixel(x: number, y: number): Rgb {
        const index = (y * this.config.config.canvas.size.width + x) * 3;
        return [
            this.canvas[index],
            this.canvas[index + 1],
            this.canvas[index + 2],
        ];
    }

    /**
     * Gets a chunk of the canvas as a new Uint8ClampedArray.
     * @param {number} x - The x-coordinate of the chunk's top-left corner.
     * @param {number} y - The y-coordinate of the chunk's top-left corner.
     * @returns {Uint8ClampedArray} The chunk data.
     */
    public getChunk(x: number, y: number): Uint8ClampedArray {
        const chunkSize = this.config.config.canvas.chunks.size;
        const canvasWidth = this.config.config.canvas.size.width;
        const canvasHeight = this.config.config.canvas.size.height;
        const chunkData = new Uint8ClampedArray(chunkSize * chunkSize * 3);

        for (let i = 0; i < chunkSize; i++) {
            for (let j = 0; j < chunkSize; j++) {
                const canvasX = x * chunkSize + i;
                const canvasY = y * chunkSize + j;
                if (canvasX < canvasWidth && canvasY < canvasHeight) {
                    const canvasIndex = (canvasY * canvasWidth + canvasX) * 3;
                    const chunkIndex = (j * chunkSize + i) * 3;
                    chunkData[chunkIndex] = this.canvas[canvasIndex];
                    chunkData[chunkIndex + 1] = this.canvas[canvasIndex + 1];
                    chunkData[chunkIndex + 2] = this.canvas[canvasIndex + 2];
                }
            }
        }
        return chunkData;
    }
}
