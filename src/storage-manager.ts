import type { BunFile } from "bun";
import chalk from "chalk";
import { Canvas } from "./canvas";
import type { Config } from "./config";
import { logger } from "./logging";

export class StorageManager {
    private modifiedChunks: Set<Uint32Array>;
    private file: BunFile;

    constructor(
        private config: Config,
        private canvas: Canvas,
    ) {
        this.modifiedChunks = new Set();
        this.file = Bun.file(this.config.config.disk.path);
    }

    public async readFromDisk(): Promise<Uint8ClampedArray> {
        logger.debug`Reading map from disk`;

        try {
            const data = await this.file.arrayBuffer();
            return new Uint8ClampedArray(data);
        } catch (e) {
            if ((e as Error).name === "ENOENT") {
                logger.info`No map file found, creating new map`;

                return Canvas.createEmptyCanvas(
                    this.config.config.canvas.size.width,
                    this.config.config.canvas.size.height,
                );
            }
        }

        throw new Error("Failed to read map from disk");
    }

    public async writeToDisk(data: Uint8ClampedArray): Promise<void> {
        logger.debug`Writing map to disk`;

        await Bun.write(this.file, data);
    }

    // biome-ignore lint/suspicious/useAwait: This is a placeholder
    public async readChunkFromDisk(
        x: number,
        y: number,
    ): Promise<Uint8ClampedArray | null> {
        logger.debug`Reading chunk ${chalk.gray(x)},${chalk.gray(y)} from disk`;

        throw new Error(
            "Reading invididual chunks from disk is not implemented",
        );
    }

    // biome-ignore lint/suspicious/useAwait: This is a placeholder
    public async writeChunkToDisk(
        x: number,
        y: number,
        // @ts-expect-error TS6133
        // biome-ignore lint/correctness/noUnusedVariables: This is a placeholder
        data: Uint8ClampedArray,
    ): Promise<void> {
        logger.debug`Writing chunk ${chalk.gray(x)},${chalk.gray(y)} to disk`;

        throw new Error("Writing invididual chunks to disk is not implemented");
    }

    public markPixelAsModified(x: number, y: number): void {
        const chunkX = Math.floor(x / this.config.config.canvas.chunks.size);
        const chunkY = Math.floor(y / this.config.config.canvas.chunks.size);
        this.modifiedChunks.add(new Uint32Array([chunkX, chunkY]));
    }

    public markChunkAsModified(x: number, y: number): void {
        this.modifiedChunks.add(new Uint32Array([x, y]));
    }

    public async flushDisk(): Promise<void> {
        for (const chunk of this.modifiedChunks) {
            const [x, y] = chunk;
            const data = this.canvas.getChunk(x, y);
            await this.writeChunkToDisk(x, y, data);
        }
        this.modifiedChunks.clear();
    }
}
