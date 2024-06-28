import type { Board } from "./Board";
import type { Camera } from "./Camera";

/**
 * Handles rendering of the game board on a canvas.
 */
export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private lastRenderedArea: {
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    } | null = null;

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

    render(): void {
        const { position, zoom } = this.camera.getState();
        const scaledCellSize = this.cellSize * zoom;

        // Calculate the visible area of the board
        const startX = Math.max(0, Math.floor(-position.x / scaledCellSize));
        const startY = Math.max(0, Math.floor(-position.y / scaledCellSize));
        const endX = Math.min(
            this.board.width,
            Math.ceil((this.canvas.width - position.x) / scaledCellSize),
        );
        const endY = Math.min(
            this.board.height,
            Math.ceil((this.canvas.height - position.y) / scaledCellSize),
        );

        // Check if the visible area has changed since last render
        if (this.hasVisibleAreaChanged(startX, startY, endX, endY)) {
            this.clear();
            this.drawBackground();
            this.drawVisibleCells(
                startX,
                startY,
                endX,
                endY,
                position,
                scaledCellSize,
            );
            this.lastRenderedArea = { startX, startY, endX, endY };
        }
    }

    private hasVisibleAreaChanged(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
    ): boolean {
        return (
            !this.lastRenderedArea ||
            this.lastRenderedArea.startX !== startX ||
            this.lastRenderedArea.startY !== startY ||
            this.lastRenderedArea.endX !== endX ||
            this.lastRenderedArea.endY !== endY
        );
    }

    private clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawBackground(): void {
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawVisibleCells(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        position: { x: number; y: number },
        scaledCellSize: number,
    ): void {
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const [r, g, b] = this.board.getPixel(x, y);
                const cellX = position.x + x * scaledCellSize;
                const cellY = position.y + y * scaledCellSize;

                if (r !== 255 || g !== 255 || b !== 255) {
                    // Only draw non-white cells
                    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    this.ctx.fillRect(
                        cellX,
                        cellY,
                        scaledCellSize,
                        scaledCellSize,
                    );
                }
            }
        }
    }

    updateCell(x: number, y: number): void {
        const { position, zoom } = this.camera.getState();
        const scaledCellSize = this.cellSize * zoom;
        const cellX = position.x + x * scaledCellSize;
        const cellY = position.y + y * scaledCellSize;

        const [r, g, b] = this.board.getPixel(x, y);

        if (r === 255 && g === 255 && b === 255) {
            this.ctx.clearRect(cellX, cellY, scaledCellSize, scaledCellSize);
        } else {
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fillRect(cellX, cellY, scaledCellSize, scaledCellSize);
        }
    }
}
