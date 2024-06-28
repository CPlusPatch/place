import { loadConfig } from "c12";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "./logging";

const ConfigSchema = z.object({
    canvas: z.object({
        size: z.object({
            width: z.number().int(),
            height: z.number().int(),
        }),
        chunks: z
            .object({
                size: z.number().int().default(16),
            })
            .default({
                size: 16,
            }),
    }),
    ratelimits: z
        .object({
            cooldown: z
                .number()
                .int()
                .default(5 * 60 * 1000),
        })
        .default({
            cooldown: 5 * 60 * 1000,
        }),
    websockets: z
        .object({
            port: z.number().int().min(1).max(65535).default(3000),
            host: z.string().default("0.0.0.0"),
        })
        .default({
            port: 3000,
            host: "0.0.0.0",
        }),
    disk: z
        .object({
            interval: z.number().int().min(1).default(5000),
            path: z.string().default("data/map.bin"),
        })
        .default({
            interval: 5000,
            path: "data/map.bin",
        }),
    logging: z
        .object({
            level: z
                .enum(["debug", "info", "warning", "error", "fatal"])
                .default("info"),
        })
        .default({
            level: "info",
        }),
});

export type IConfig = z.infer<typeof ConfigSchema>;

/**
 * The Config class represents the configuration of the server.
 */
export class Config {
    /**
     * Constructs a new Config instance.
     * @param {IConfig} config - The configuration object.
     */
    constructor(public config: IConfig) {}

    /**
     * Loads the configuration from the config file.
     * @returns {Promise<Config>} The loaded configuration.
     */
    static async load(): Promise<Config> {
        const { config } = await loadConfig<IConfig>({
            configFile: "config/config.toml",
        });

        const parsed = await ConfigSchema.safeParseAsync(config);

        if (!parsed.success) {
            const error = fromZodError(parsed.error);

            logger.fatal`Invalid configuration: ${error.message}`;
            logger.fatal`Press Ctrl+C to exit`;

            // Hang until Ctrl+C is pressed
            await Bun.sleep(Number.POSITIVE_INFINITY);
            process.exit(1);
        }

        return new Config(parsed.data);
    }
}
