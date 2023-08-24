import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { config } from "dotenv";
import { get } from "env-var";

// Initializing dotenv
config();

export const typeormConfig: TypeOrmModuleOptions = {
  type: "mariadb",
  host: get("TYPEORM_HOST").required().asString(),
  port: get("TYPEORM_PORT").required().asIntPositive(),
  username: get("TYPEORM_USERNAME").required().asString(),
  password: get("TYPEORM_PASSWORD").required().asString(),
  database: get("TYPEORM_DATABASE").required().asString(),
  driver: "mariadb",
  entities: ["dist/**/*.entity.js"],
  autoLoadEntities: true,
  logging: ["error", "migration", "schema"],
  synchronize: true,
  dropSchema: true,
  extra: { connectionLimit: 1000000 },
};
module.exports = typeormConfig;
