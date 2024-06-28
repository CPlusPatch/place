import type { Board } from "./Board";
import type { Camera } from "./Camera";

/**
 * Handles rendering of the game board on a canvas.
 */
export class Renderer {
    private ctx: CanvasRenderingContext2D;

    /**
     * Creates a new Renderer instance.
     * @param canvas - The canvas element to render on.
     * @param board - The game board to render.
     * @param camera - The camera to use for rendering.
     * @param cellSize - The size of each cell.
     */
    constructor(
        private canvas: HTMLCanvasElement,
        private board: Board,
        private camera: Camera,
        private cellSize: number,
    ) {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        this.ctx = ctx;
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * Renders the game board on the canvas.
     */
    render(): void {
        this.clear();
        this.drawBackground();
        this.drawCells();
        this.camera.update();
        requestAnimationFrame(() => this.render());
    }

    /**
     * Clears the canvas.
     */
    private clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws the background of the canvas.
     */
    private drawBackground(): void {
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws all cells on the canvas.
     */
    private drawCells(): void {
        const { position, zoom } = this.camera.getState();

        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                const color = this.board.getCellColor(i, j);
                if (color) {
                    const [r, g, b] = color;
                    const cellX = position.x + i * this.cellSize * zoom;
                    const cellY = position.y + j * this.cellSize * zoom;

                    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    this.ctx.fillRect(
                        cellX,
                        cellY,
                        this.cellSize * zoom,
                        this.cellSize * zoom,
                    );
                }
            }
        }
    }
}
