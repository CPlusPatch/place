import chalk from "chalk";
import type { Canvas } from "./canvas";
import type { Config } from "./config";
import { logger } from "./logging";

export class StorageManager {
    private config: Config;
    private canvas: Canvas;

    constructor(config: Config, canvas: Canvas) {
        this.config = config;
        this.canvas = canvas;
    }

    // biome-ignore lint/suspicious/useAwait: <explanation>
    async readChunkFromDisk(
        x: number,
        y: number,
    ): Promise<Uint8ClampedArray | null> {
        logger.debug`Reading chunk ${chalk.gray(x)},${chalk.gray(y)} from disk`;
        // Implement actual disk read logic here
        return null;
    }

    // biome-ignore lint/suspicious/useAwait: <explanation>
    async writeChunkToDisk(
        x: number,
        y: number,
        // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        data: Uint8ClampedArray,
    ): Promise<void> {
        logger.debug`Writing chunk ${chalk.gray(x)},${chalk.gray(y)} to disk`;
        // Implement actual disk write logic here
    }
}
