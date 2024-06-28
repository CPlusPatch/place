/**
 * Configuration interface for the benchmark.
 */
interface Config {
    /** WebSocket server URL */
    serverUrl: string;
    /** Total number of clients to simulate */
    totalClients: number;
    /** Number of new connections to establish per second */
    connectionsPerSecond: number;
    /** Duration of the simulation in seconds */
    simulationDuration: number;
    /** Width of the canvas in pixels */
    canvasWidth: number;
    /** Height of the canvas in pixels */
    canvasHeight: number;
    /** Probability of sending a pixel update (0-1) */
    updateProbability: number;
    /** Probability of requesting a chunk (0-1) */
    chunkRequestProbability: number;
}

/**
 * Represents a single client connection to the r/Place clone server.
 */
class Client {
    private ws: WebSocket;
    private lastUpdate = 0;
    private cooldown = 5000; // 5 seconds cooldown, adjust as needed

    /**
     * Creates a new Client instance.
     * @param {Config} config - The benchmark configuration.
     */
    constructor(private config: Config) {
        this.ws = new WebSocket(config.serverUrl);
        this.setupEventListeners();
    }

    /**
     * Sets up WebSocket event listeners.
     */
    private setupEventListeners(): void {
        this.ws.addEventListener("open", () => this.onOpen());
        this.ws.addEventListener("message", (data) => this.onMessage(data));
        this.ws.addEventListener("close", () => this.onClose());
        this.ws.addEventListener("error", (error) => this.onError(error));
    }

    /**
     * Handles the WebSocket 'open' event.
     */
    private onOpen(): void {
        console.info("Connected to server");
        this.requestMetadata();
    }

    /**
     * Handles incoming WebSocket messages.
     * @param {MessageEvent<unknown>} data - The received message data.
     */
    private onMessage(data: MessageEvent<unknown>): void {
        const message = JSON.parse(data.data as unknown as string);
        if (message.type === "metadata") {
            // Process metadata if needed
        }
    }

    /**
     * Handles the WebSocket 'close' event.
     */
    private onClose(): void {
        console.info("Disconnected from server");
    }

    /**
     * Handles WebSocket errors.
     * @param {Event} error - The error object.
     */
    private onError(error: Event): void {
        console.error("WebSocket error:", error);
    }

    /**
     * Requests metadata from the server.
     */
    private requestMetadata(): void {
        this.ws.send(JSON.stringify({ type: "getMetadata" }));
    }

    /**
     * Performs a client update, potentially sending a pixel update or requesting a chunk.
     */
    public update(): void {
        const now = Date.now();
        if (now - this.lastUpdate < this.cooldown) {
            return;
        }

        if (Math.random() < this.config.updateProbability) {
            this.sendPixelUpdate();
        } else if (Math.random() < this.config.chunkRequestProbability) {
            this.requestChunk();
        }

        this.lastUpdate = now;
    }

    /**
     * Sends a pixel update to the server.
     */
    private sendPixelUpdate(): void {
        const x = Math.floor(Math.random() * this.config.canvasWidth);
        const y = Math.floor(Math.random() * this.config.canvasHeight);
        const color: [number, number, number] = [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
        ];

        this.ws.send(
            JSON.stringify({
                type: "pixelUpdate",
                x,
                y,
                color,
            }),
        );
    }

    /**
     * Requests a chunk from the server.
     */
    private requestChunk(): void {
        const x = Math.floor(Math.random() * (this.config.canvasWidth / 32)); // Assuming 32x32 chunks
        const y = Math.floor(Math.random() * (this.config.canvasHeight / 32));

        this.ws.send(
            JSON.stringify({
                type: "getChunk",
                x,
                y,
            }),
        );
    }

    /**
     * Closes the WebSocket connection.
     */
    public close(): void {
        this.ws.close();
    }
}

/**
 * Manages the benchmark process, including client creation and result reporting.
 */
class Benchmark {
    private clients: Client[] = [];
    private startTime = 0;
    private updateInterval: Timer | null = null;

    /**
     * Creates a new Benchmark instance.
     * @param {Config} config - The benchmark configuration.
     */
    constructor(private config: Config) {}

    /**
     * Runs the benchmark.
     */
    public async run(): Promise<void> {
        this.startTime = performance.now();

        await this.connectClients();
        this.startUpdates();

        await new Promise((resolve) =>
            setTimeout(resolve, this.config.simulationDuration * 1000),
        );

        this.stopUpdates();
        this.disconnectClients();
        this.printResults();
    }

    /**
     * Connects all clients to the server.
     */
    private async connectClients(): Promise<void> {
        const delay = 1000 / this.config.connectionsPerSecond;
        for (let i = 0; i < this.config.totalClients; i++) {
            this.clients.push(new Client(this.config));
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    /**
     * Starts the client update loop.
     */
    private startUpdates(): void {
        this.updateInterval = setInterval(() => {
            for (const client of this.clients) {
                client.update();
            }
        }, 100); // Update every 100ms
    }

    /**
     * Stops the client update loop.
     */
    private stopUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    /**
     * Disconnects all clients from the server.
     */
    private disconnectClients(): void {
        for (const client of this.clients) {
            client.close();
        }
    }

    /**
     * Prints the benchmark results.
     */
    private printResults(): void {
        const endTime = performance.now();
        const duration = (endTime - this.startTime) / 1000;
        console.info("Benchmark Results:");
        console.info(`Total Clients: ${this.config.totalClients}`);
        console.info(`Duration: ${duration.toFixed(2)} seconds`);
        console.info(
            `Connections per Second: ${this.config.connectionsPerSecond}`,
        );
        console.info(`Update Probability: ${this.config.updateProbability}`);
        console.info(
            `Chunk Request Probability: ${this.config.chunkRequestProbability}`,
        );
    }
}

/**
 * Parses command-line arguments and returns a Config object.
 * @returns {Config} The parsed configuration.
 */
function parseArguments(): Config {
    const args = process.argv.slice(2);
    const parsedArgs: Partial<Config> = {};

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace("--", "") as keyof Config;
        const value = args[i + 1];

        if (key in defaultConfig) {
            // @ts-expect-error TS2322
            parsedArgs[key] =
                typeof defaultConfig[key] === "number" ? Number(value) : value;
        }
    }

    return { ...defaultConfig, ...parsedArgs };
}

// Default configuration
const defaultConfig: Config = {
    serverUrl: "ws://localhost:3000",
    totalClients: 10000,
    connectionsPerSecond: 1000,
    simulationDuration: 20,
    canvasWidth: 800,
    canvasHeight: 600,
    updateProbability: 0.7,
    chunkRequestProbability: 0.2,
};

// Parse command-line arguments
const config = parseArguments();

// Run the benchmark
const benchmark = new Benchmark(config);
benchmark.run().catch(console.error);
