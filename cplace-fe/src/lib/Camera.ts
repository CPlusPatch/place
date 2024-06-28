import type { Position } from "./Board";

/**
 * Manages the camera state and operations.
 */
export class Camera {
    private actualPosition: Position = { x: 0, y: 0 };
    private targetPosition: Position = { x: 0, y: 0 };
    private actualZoom = 1;
    public zoom = 1;

    /**
     * Creates a new Camera instance.
     * @param canvasWidth - The width of the canvas.
     * @param canvasHeight - The height of the canvas.
     * @param boardWidth - The width of the game board.
     * @param boardHeight - The height of the game board.
     * @param cellSize - The size of each cell.
     */
    constructor(
        private canvasWidth: number,
        private canvasHeight: number,
        private boardWidth: number,
        private boardHeight: number,
        private cellSize: number,
    ) {
        this.centerCamera(false);
    }

    setCanvasSize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    /**
     * Centers the camera on the board.
     */
    centerCamera(animate = true): void {
        this.targetPosition = {
            x:
                (this.canvasWidth -
                    this.boardWidth * this.cellSize * this.zoom) /
                2,
            y:
                (this.canvasHeight -
                    this.boardHeight * this.cellSize * this.zoom) /
                2,
        };

        if (!animate) {
            this.actualPosition = { ...this.targetPosition };
        }
    }

    /**
     * Updates the camera's position and zoom.
     */
    update(): void {
        this.actualPosition.x +=
            (this.targetPosition.x - this.actualPosition.x) * 0.1;
        this.actualPosition.y +=
            (this.targetPosition.y - this.actualPosition.y) * 0.1;
        this.actualZoom += (this.zoom - this.actualZoom) * 0.1;
    }

    /**
     * Moves the camera.
     * @param dx - The change in x-position.
     * @param dy - The change in y-position.
     */
    move(dx: number, dy: number): void {
        this.targetPosition.x += dx;
        this.targetPosition.y += dy;
    }

    /**
     * Adjusts the zoom level.
     * @param factor - The zoom factor to apply.
     */
    adjustZoom(factor: number): void {
        if (this.zoom * factor < 0.2) {
            return;
        }
        if (this.zoom * factor > 3) {
            return;
        }

        // Calculate the center of the canvas
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        // Calculate the difference between the center and the target position
        const diffX = centerX - this.targetPosition.x;
        const diffY = centerY - this.targetPosition.y;

        // Apply the zoom factor
        this.zoom *= factor;

        // Adjust the target position based on the new zoom level and the difference
        this.targetPosition.x = centerX - diffX * factor;
        this.targetPosition.y = centerY - diffY * factor;
    }

    /**
     * Gets the current camera state.
     * @returns The current position and zoom level.
     */
    getState(): { position: Position; zoom: number } {
        return {
            position: { ...this.actualPosition },
            zoom: this.actualZoom,
        };
    }
}
