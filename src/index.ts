import chalk from "chalk";
import { Canvas } from "./canvas";
import { ClientManager } from "./client-manager";
// server.ts
import { Config } from "./config";
import { configureLoggers, logger } from "./logging";
import { MessageHandler } from "./message-handler";
import { StorageManager } from "./storage-manager";

class PlaceServer {
    private config: Config;
    private canvas: Canvas;
    private clientManager: ClientManager;
    private storageManager: StorageManager;
    private messageHandler: MessageHandler;

    constructor(config: Partial<Config> = {}) {
        this.config = new Config(config);
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

    start(): void {
        Bun.serve({
            port: this.config.port,

            fetch: (req, server) => {
                if (server.upgrade(req)) {
                    return; // Do not return a Response
                }
                return new Response("r/place clone server is running", {
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
            `ws://localhost:${this.config.port}`,
        )}`;
    }
}

// Start the server
await configureLoggers();

const server = new PlaceServer();
server.start();
