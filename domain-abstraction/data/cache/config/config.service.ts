import { Injectable } from "@nestjs/common";

import { DEFAULT_CONFIG } from "./config.default";
import { ConfigData, ConfigRedisData } from "./config.interface";

/**
 * Provides a means to access the application configuration.
 */
@Injectable()
export class ConfigService {
  private config: ConfigData;

  constructor(data: ConfigData = DEFAULT_CONFIG) {
    this.config = data;
  }
  public loadFromEnv() {
    this.config = this.parseConfigFromEnv(process.env);
  }

  private parseConfigFromEnv(env: NodeJS.ProcessEnv): ConfigData {
    return {
      env: env.ENV || DEFAULT_CONFIG.env,
      port: env.PORT ? parseInt(env.PORT, 10) : DEFAULT_CONFIG.port,
      logLevel: env.LOG_LEVEL || DEFAULT_CONFIG.logLevel,
      redis: env.REDIS_HOST ? this.getRedisConfig(env) : DEFAULT_CONFIG.redis,
    };
  }
  private getRedisConfig(env: NodeJS.ProcessEnv): ConfigRedisData {
    return {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      ttl: parseInt(env.REDIS_TTL, 10),
    };
  }
  public get(): Readonly<ConfigData> {
    return this.config;
  }
}
