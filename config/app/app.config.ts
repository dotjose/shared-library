import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const envDevelopmentName = "development";
const env = process.env.NODE_ENV || envDevelopmentName;
const configs = {
  base: {
    ENV: env,
    DEV: env === envDevelopmentName,
    // General
    NAME: process.env.APP_NAME || "Business Microservice",
    TITLE: process.env.APP_TITLE || "Business",
    DESCRIPTION: process.env.APP_DESCRIPTION || "Business API Microservice",
    // API
    PREFIX: process.env.APP_PREFIX || "api/v1",
    VERSION: process.env.APP_VERSION || "1.0",
    API_EXPLORER_PATH: process.env.APP_API_EXPLORER_PATH || "/api/v1",
    // Server
    HOST: process.env.APP_HOST || "0.0.0.0",
    PORT: process.env.APP_PORT || 7070,

    
    //back_office MS base URL
    BACK_OFFICE_API_HOST: process.env.BACK_OFFICE_API_HOST || "https://mss-backoffice-restapi.sepa-cyber.staging/api/v1/",

    //Redis Server
    REDIS_SERVER_URL: process.env.REDIS_SERVER || "redis://192.168.13.132:6379",
    REDIS_NAME: process.env.REDIS_NAME || "",
    LOGGER_FILE: "./src/log/log-info.json",
    //Kafka Server
    KAFKA_HOST: process.env.KAFKA_HOST || "10.30.91.70",
    KAFKA_PORT: process.env.KAFKA_PORT || "9092",
    KAFKA_GROUPID: process.env.KAFKA_GROUPID || "11",
    KAFKA_CLIENTID: process.env.KAFKA_CLIENTID || "1",
    KAFKA_TOPIC: process.env.KAFKA_TOPIC || "TutorialTopic",
    // Event Store
    EVENT_STORE_SETTINGS: {
      protocol: process.env.EVENT_STORE_PROTOCOL || "http",
      hostname: process.env.EVENT_STORE_HOSTNAME || "0.0.0.0",
      tcpPort: process.env.EVENT_STORE_TCP_PORT || 1113,
      httpPort: process.env.EVENT_STORE_HTTP_PORT || 2113,
      credentials: {
        username: process.env.EVENT_STORE_CREDENTIALS_USERNAME || "admin",
        password: process.env.EVENT_STORE_CREDENTIALS_PASSWORD || "changeit",
      },
      poolOptions: {
        min: process.env.EVENT_STORE_POOLOPTIONS_MIN || 1,
        max: process.env.EVENT_STORE_POOLOPTIONS_MAX || 10,
      },
    },
  },
  development: {},
  production: {
    PORT: process.env.APP_PORT || 7071,
  },
  test: {
    PORT: 7072,
  },
};
const config = { ...configs.base, ...configs[env] };

export { config };
