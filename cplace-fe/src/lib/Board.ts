/**
 * Represents a color in RGB format.
 */
type Rgb = [number, number, number];

/**
 * Represents a 2D position.
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Manages the game board state and operations.
 */
export class Board {
    private cells: Rgb[];

    /**
     * Creates a new Board instance.
     * @param width - The width of the board.
     * @param height - The height of the board.
     */
    constructor(
        public readonly width: number,
        public readonly height: number,
    ) {
        this.cells = Array.from({ length: width * height }, () => [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
        ]);
    }

    /**
     * Gets the color of a cell at the specified coordinates.
     * @param x - The x-coordinate of the cell.
     * @param y - The y-coordinate of the cell.
     * @returns The color of the cell, or null if out of bounds.
     */
    getCellColor(x: number, y: number): Rgb | null {
        return this.cells[x + y * this.width] ?? null;
    }
}
