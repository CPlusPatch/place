import { Board, type Rgb } from "./Board";
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";
import { type ServerConfig, ServerConnection } from "./ServerConnection";

/**
 * Main game class that coordinates board, camera, and renderer.
 */
export class Game {
    private board: Board | null = null;
    private camera: Camera | null = null;
    private renderer: Renderer | null = null;
    private serverConnection: ServerConnection;
    private lastUpdate = 0;
    private isLoading = true;
    private error: string | null = null;

    /**
     * Creates a new Game instance.
     * @param canvas - The canvas element to render on.
     * @param cellSize - The size of each cell.
     * @param serverUrl - The URL of the WebSockets server.
     */
    constructor(
        private canvas: HTMLCanvasElement,
        private cellSize: number,
        serverUrl: string,
    ) {
        this.serverConnection = new ServerConnection(serverUrl);
        this.setupServerListeners();
    }

    private setupServerListeners(): void {
        this.serverConnection.on("metadata", (data) => {
            this.handleMetadata(data as unknown as ServerConfig);
        });

        this.serverConnection.on("chunk", (data) => {
            this.handleChunk(
                data as unknown as { x: number; y: number; data: number[] },
            );
        });

        this.serverConnection.on("pixelUpdate", (data) => {
            this.handlePixelUpdate(
                data as unknown as { x: number; y: number; color: Rgb },
            );
        });
    }

    private handleMetadata(data: ServerConfig): void {
        this.serverConnection.config = data;
        this.board = new Board(data.canvas.width, data.canvas.height);
        this.camera = new Camera(
            this.canvas.width,
            this.canvas.height,
            data.canvas.width,
            data.canvas.height,
            this.cellSize,
        );
        this.renderer = new Renderer(
            this.canvas,
            this.board,
            this.camera,
            this.cellSize,
        );

        // Request initial chunks
        for (
            let x = 0;
            x < Math.ceil(data.canvas.width / data.chunks.size);
            x++
        ) {
            for (
                let y = 0;
                y < Math.ceil(data.canvas.height / data.chunks.size);
                y++
            ) {
                this.serverConnection.getChunk(x, y);
            }
        }
    }

    private handleChunk(data: { x: number; y: number; data: number[] }): void {
        if (this.board && this.serverConnection.config) {
            this.board.setChunk(
                data.x,
                data.y,
                this.serverConnection.config.chunks.size,
                data.data,
            );

            this.camera = new Camera(
                this.canvas.width,
                this.canvas.height,
                this.serverConnection.config.canvas.width,
                this.serverConnection.config.canvas.height,
                this.cellSize,
            );
            this.renderer = new Renderer(
                this.canvas,
                this.board,
                this.camera,
                this.cellSize,
            );
        }
        this.isLoading = false;
    }

    private handlePixelUpdate(data: {
        x: number;
        y: number;
        color: Rgb;
    }): void {
        if (this.board && this.renderer) {
            this.board.setPixel(data.x, data.y, data.color);
            this.renderer.updateCell(data.x, data.y);
        }
    }

    /**
     * Starts the game loop.
     */
    start(): void {
        this.gameLoop();
    }

    private gameLoop(): void {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    private update(): void {
        if (this.camera) {
            this.camera.update();
        }
    }

    private render(): void {
        if (this.isLoading) {
            this.renderLoadingScreen();
        } else if (this.error) {
            this.renderErrorScreen();
        } else if (this.renderer) {
            this.renderer.render();
        }
    }

    private renderLoadingScreen(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#333";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "Loading...",
            this.canvas.width / 2,
            this.canvas.height / 2,
        );
    }

    private renderErrorScreen(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#ff0000";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            `Error: ${this.error}`,
            this.canvas.width / 2,
            this.canvas.height / 2,
        );
    }

    /**
     * Handles key press events.
     * @param event - The keyboard event.
     */
    handleKeyPress(event: KeyboardEvent): void {
        // Get move distance base off of zoom
        const moveDistance = 10 * (1 / (this.camera?.getState().zoom ?? 1));
        switch (event.key) {
            case "z":
            case "ArrowUp":
                this.camera?.move(0, moveDistance);
                break;
            case "s":
            case "ArrowDown":
                this.camera?.move(0, -moveDistance);
                break;
            case "q":
            case "ArrowLeft":
                this.camera?.move(moveDistance, 0);
                break;
            case "d":
            case "ArrowRight":
                this.camera?.move(-moveDistance, 0);
                break;
        }
    }

    /**
     * Handles scroll events for zooming.
     * @param event - The wheel event.
     */
    handleScroll(event: WheelEvent): void {
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        this.camera?.adjustZoom(zoomFactor);
    }

    handleClick(event: MouseEvent): void {
        if (
            this.board &&
            this.camera &&
            this.renderer &&
            this.serverConnection.config
        ) {
            const rect = this.canvas.getBoundingClientRect();
            const { position, zoom } = this.camera.getState();
            const x = Math.floor(
                (event.clientX - rect.left - position.x) /
                    (this.cellSize * zoom),
            );
            const y = Math.floor(
                (event.clientY - rect.top - position.y) /
                    (this.cellSize * zoom),
            );

            if (
                x >= 0 &&
                x < this.board.width &&
                y >= 0 &&
                y < this.board.height
            ) {
                const now = Date.now();
                if (
                    now - this.lastUpdate >=
                    this.serverConnection.config.ratelimits.cooldown
                ) {
                    const color: Rgb = [
                        Math.floor(Math.random() * 256),
                        Math.floor(Math.random() * 256),
                        Math.floor(Math.random() * 256),
                    ];
                    this.serverConnection.updatePixel(x, y, color);
                    this.board.setPixel(x, y, color);
                    this.renderer.updateCell(x, y);
                    this.lastUpdate = now;
                }
            }
        }
    }

    handleResize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.camera) {
            this.camera.centerCamera();
        }
        if (this.renderer && this.board && this.camera) {
            this.renderer = new Renderer(
                this.canvas,
                this.board,
                this.camera,
                this.cellSize,
            );
        }
    }
}
