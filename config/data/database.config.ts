import { typeormConfig } from "./ormconfig";

const database = {
  ...typeormConfig,
  entities: ["src/**/*.entity.ts"],
  migrationsTableName: "migrations",
  migrations: ["src/**/migrations/*.ts"],
  seeds: ["src/**/seeding/**/*.seeder.ts"],
  factories: ["src/**/factories/**/*.ts"],
  cli: {
    migrationsDir: `src/infrastructure/database/migrations`,
  },
  synchronize: true,
  dropSchema: true,
};

export = database;
