import { describe, expect, test } from "bun:test";
import { Config } from "./config";

describe("Config", () => {
    test("should use default values when no config is provided", () => {
        const config = new Config();
        expect(config.canvasSizeX).toBe(1000);
        expect(config.canvasSizeY).toBe(1000);
        expect(config.chunkSize).toBe(100);
        expect(config.cooldownPeriod).toBe(5 * 60 * 1000);
        expect(config.port).toBe(3000);
    });

    test("should override default values with provided config", () => {
        const customConfig = {
            canvasSizeX: 2000,
            canvasSizeY: 1500,
            chunkSize: 200,
            cooldownPeriod: 10 * 60 * 1000,
            port: 8080,
        };
        const config = new Config(customConfig);
        expect(config.canvasSizeX).toBe(2000);
        expect(config.canvasSizeY).toBe(1500);
        expect(config.chunkSize).toBe(200);
        expect(config.cooldownPeriod).toBe(10 * 60 * 1000);
        expect(config.port).toBe(8080);
    });
});
