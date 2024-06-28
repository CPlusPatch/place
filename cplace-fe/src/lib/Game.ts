import { Board } from "./Board";
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";

/**
 * Main game class that coordinates board, camera, and renderer.
 */
export class Game {
    private board: Board;
    private camera: Camera;
    private renderer: Renderer;

    /**
     * Creates a new Game instance.
     * @param canvas - The canvas element to render on.
     * @param boardWidth - The width of the game board.
     * @param boardHeight - The height of the game board.
     * @param cellSize - The size of each cell.
     */
    constructor(
        private canvas: HTMLCanvasElement,
        boardWidth: number,
        boardHeight: number,
        cellSize: number,
    ) {
        this.board = new Board(boardWidth, boardHeight);
        this.camera = new Camera(
            canvas.width,
            canvas.height,
            boardWidth,
            boardHeight,
            cellSize,
        );
        this.renderer = new Renderer(canvas, this.board, this.camera, cellSize);
    }

    /**
     * Starts the game loop.
     */
    start(): void {
        this.renderer.render();
    }

    /**
     * Handles key press events.
     * @param event - The keyboard event.
     */
    handleKeyPress(event: KeyboardEvent): void {
        const moveDistance = 10;
        switch (event.key) {
            case "z":
            case "ArrowUp":
                this.camera.move(0, moveDistance);
                break;
            case "s":
            case "ArrowDown":
                this.camera.move(0, -moveDistance);
                break;
            case "q":
            case "ArrowLeft":
                this.camera.move(moveDistance, 0);
                break;
            case "d":
            case "ArrowRight":
                this.camera.move(-moveDistance, 0);
                break;
        }
    }

    /**
     * Handles scroll events for zooming.
     * @param event - The wheel event.
     */
    handleScroll(event: WheelEvent): void {
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        this.camera.adjustZoom(zoomFactor);
    }

    /**
     * Handles window resize events.
     */
    handleResize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.setCanvasSize(window.innerWidth, window.innerHeight);
        this.camera.centerCamera();
    }
}
