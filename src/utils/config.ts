import { StashConfig, StashInstance } from "./StashInstance";
interface Config {
    logging: boolean;
    testMode: boolean;
    instances: StashConfig[];
    discord: {
        token: string;
        clientId: string;
        guilds: string[];
        webhook: string;
    };
    database: {
        filename: string;
    };
}

import * as untypedConfig from "../config.json";
const config: Config = untypedConfig;
const instances: Record<string, StashInstance> = {};
for (const instance of config.instances) {
    instances[instance.name] = new StashInstance(instance);
}
export { instances, config };
export default config;