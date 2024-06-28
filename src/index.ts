import chalk from "chalk";
import { Canvas } from "./canvas";
import { ClientManager } from "./client-manager";
import { Config } from "./config";
import { configureLoggers, logger } from "./logging";
import { MessageHandler } from "./message-handler";
import { StorageManager } from "./storage-manager";

process.on("SIGINT", () => {
    process.exit();
});

process.on("uncaughtException", (err) => {
    logger.fatal`Uncaught exception: ${err}`;
    console.error(err);
    logger.fatal`Press Ctrl+C to exit`;

    // Hang until Ctrl+C is pressed
    Bun.sleepSync(Number.POSITIVE_INFINITY);
    process.exit(1);
});

class PlaceServer {
    private canvas: Canvas;
    private clientManager: ClientManager;
    private storageManager: StorageManager;
    private messageHandler: MessageHandler;

    constructor(private config: Config) {
        this.canvas = new Canvas(this.config);
        this.clientManager = new ClientManager();
        this.storageManager = new StorageManager(this.config, this.canvas);
        this.messageHandler = new MessageHandler(
            this.config,
            this.canvas,
            this.clientManager,
            this.storageManager,
        );
    }

    public async start(): Promise<void> {
        const map = await this.storageManager.readFromDisk();

        this.canvas.setCanvas(map);

        Bun.serve({
            port: this.config.config.websockets.port,
            hostname: this.config.config.websockets.host,
            fetch: (req, server) => {
                if (server.upgrade(req)) {
                    return;
                }

                return new Response("The server is running!", {
                    status: 200,
                });
            },

            websocket: {
                open: (ws) => {
                    this.clientManager.addClient(ws);
                },

                message: (ws, message) => {
                    this.messageHandler.handleMessage(ws, message);
                },

                close: (ws) => {
                    this.clientManager.removeClient(ws);
                },
            },
        });

        logger.info`WebSocket server is running on ${chalk.blue(
            `ws://${this.config.config.websockets.host}:${this.config.config.websockets.port}`,
        )}`;

        setInterval(() => {
            this.storageManager.writeToDisk(this.canvas.getCanvas());
        }, this.config.config.disk.interval);
    }
}

// Start the server
await configureLoggers();

const config = await Config.load();
await configureLoggers(false, config.config);
const server = new PlaceServer(config);
await server.start();
