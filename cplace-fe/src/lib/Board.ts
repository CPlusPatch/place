/**
 * Represents a color in RGB format.
 */
export type Rgb = [number, number, number];

/**
 * Represents a 2D position.
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Manages the game board state and operations.
 * @class
 */
export class Board {
    private cells: Uint8ClampedArray;

    /**
     * @constructor
     * @param {number} width - The width of the board.
     * @param {number} height - The height of the board.
     */
    constructor(
        public readonly width: number,
        public readonly height: number,
    ) {
        this.cells = new Uint8ClampedArray(width * height * 3).fill(255);
    }

    /**
     * Sets the color of a pixel at a specific position.
     * @param {number} x - The x-coordinate of the pixel.
     * @param {number} y - The y-coordinate of the pixel.
     * @param {Rgb} color - The color to set.
     */
    public setPixel(x: number, y: number, color: Rgb): void {
        const index = (y * this.width + x) * 3;
        this.cells[index] = color[0];
        this.cells[index + 1] = color[1];
        this.cells[index + 2] = color[2];
    }

    /**
     * Gets the color of a pixel at a specific position.
     * @param {number} x - The x-coordinate of the pixel.
     * @param {number} y - The y-coordinate of the pixel.
     * @returns {Rgb} The color of the pixel.
     */
    public getPixel(x: number, y: number): Rgb {
        const index = (y * this.width + x) * 3;
        return [
            this.cells[index],
            this.cells[index + 1],
            this.cells[index + 2],
        ];
    }

    /**
     * Sets a chunk of pixels on the board.
     * @param {number} chunkX - The x-coordinate of the chunk.
     * @param {number} chunkY - The y-coordinate of the chunk.
     * @param {number} chunkSize - The size of the chunk.
     * @param {number[]} chunkData - The pixel data of the chunk.
     */
    public setChunk(
        chunkX: number,
        chunkY: number,
        chunkSize: number,
        chunkData: number[],
    ): void {
        for (let y = 0; y < chunkSize; y++) {
            for (let x = 0; x < chunkSize; x++) {
                const boardX = chunkX * chunkSize + x;
                const boardY = chunkY * chunkSize + y;
                if (boardX < this.width && boardY < this.height) {
                    const chunkIndex = (y * chunkSize + x) * 3;
                    this.setPixel(boardX, boardY, [
                        chunkData[chunkIndex],
                        chunkData[chunkIndex + 1],
                        chunkData[chunkIndex + 2],
                    ]);
                }
            }
        }
    }
}
