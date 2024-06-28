import type { Rgb } from "./Board";

/**
 * Represents the server configuration.
 */
export interface ServerConfig {
    canvas: {
        width: number;
        height: number;
    };
    chunks: {
        size: number;
    };
    ratelimits: {
        cooldown: number;
    };
}

/**
 * Manages the WebSocket connection and communication with the server.
 * @class
 */
export class ServerConnection {
    private socket: WebSocket;
    private messageHandlers: Map<string, (data: unknown) => void> = new Map();
    public isConnected = false;
    public config: ServerConfig | null = null;

    /**
     * @constructor
     * @param {string} url - The URL of the server.
     */
    constructor(private url: string) {
        this.socket = new WebSocket(url);
        this.setupSocketListeners();
    }

    /**
     * Sets up the WebSocket listeners.
     * @private
     */
    private setupSocketListeners(): void {
        this.socket.onopen = () => {
            this.isConnected = true;
            this.getMetadata();
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
                handler(message);
            }
        };

        this.socket.onclose = () => {
            this.isConnected = false;
        };
    }

    /**
     * Registers a message handler for a specific message type.
     * @param {string} messageType - The type of the message.
     * @param {(data: unknown) => void} handler - The handler function.
     */
    public on(messageType: string, handler: (data: unknown) => void): void {
        this.messageHandlers.set(messageType, handler);
    }

    /**
     * Sends a message to the server.
     * @param {object} message - The message to send.
     */
    public send(message: object): void {
        if (this.isConnected) {
            this.socket.send(JSON.stringify(message));
        }
    }

    /**
     * Requests the metadata from the server.
     * @private
     */
    private getMetadata(): void {
        this.send({ type: "getMetadata" });
    }

    /**
     * Requests a chunk from the server.
     * @param {number} x - The x-coordinate of the chunk.
     * @param {number} y - The y-coordinate of the chunk.
     */
    public getChunk(x: number, y: number): void {
        this.send({ type: "getChunk", x, y });
    }

    /**
     * Sends a pixel update to the server.
     * @param {number} x - The x-coordinate of the pixel.
     * @param {number} y - The y-coordinate of the pixel.
     * @param {Rgb} color - The new color of the pixel.
     */
    public updatePixel(x: number, y: number, color: Rgb): void {
        this.send({ type: "pixelUpdate", x, y, color });
    }
}
