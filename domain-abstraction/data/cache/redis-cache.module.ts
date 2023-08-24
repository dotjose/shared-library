import {
  Module,
  DynamicModule,
  CacheModuleOptions,
  Logger,
} from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { ConfigService } from "./config/config.service";
import * as redisStore from "cache-manager-redis-store";
import { CacheModule } from "@nestjs/common";
import { RedisCacheService } from "./redis-cache.service";

@Module({})
export class RedisCacheModule {
  public static geRedisConnectionOptions(
    config: ConfigService
  ): CacheModuleOptions {
    const redis = config.get().redis;

    if (!redis) {
      Logger.log("redis config is missing");
    }
    return {
      store: redisStore,
      host: redis.host,
      port: redis.port,
      ttl: redis.ttl,
    };
  }
  public static forRoot(): DynamicModule {
    return {
      module: CacheModule,
      imports: [
        CacheModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) =>
            RedisCacheModule.geRedisConnectionOptions(configService),
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [RedisCacheService],
      exports: [RedisCacheService],
    };
  }
}
