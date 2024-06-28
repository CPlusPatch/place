import { describe, expect, test } from "bun:test";
import { Config, type IConfig } from "./config";

describe("Config", () => {
    test("should override default values with provided config", () => {
        const customConfig: IConfig = {
            canvas: {
                chunks: {
                    size: 16,
                },
                size: {
                    height: 500,
                    width: 1000,
                },
            },
            ratelimits: {
                cooldown: 10 * 60 * 1000,
            },
            websockets: {
                host: "localhost",
                port: 8080,
            },
            disk: {
                interval: 5000,
                path: "data/map.bin",
            },
            logging: {
                level: "info",
            },
        };
        const config = new Config(customConfig);
        expect(config.config).toEqual(customConfig);
    });
});
