// Config.ts
export interface IConfig {
    canvasSizeX: number;
    canvasSizeY: number;
    chunkSize: number;
    cooldownPeriod: number;
    port: number;
}

export class Config implements IConfig {
    canvasSizeX!: number;
    canvasSizeY!: number;
    chunkSize!: number;
    cooldownPeriod!: number;
    port!: number;

    constructor(config: Partial<IConfig> = {}) {
        const defaultConfig: IConfig = {
            canvasSizeX: 1000,
            canvasSizeY: 1000,
            chunkSize: 100,
            cooldownPeriod: 5 * 60 * 1000, // 5 minutes
            port: 3000,
        };

        Object.assign(this, defaultConfig, config);
    }
}
