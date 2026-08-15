import Redis from "ioredis";

import { env } from "./env.config.js";
import logger from "./logger.config.js";

const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  password: env.redisPassword || undefined,

  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  logger.info("Redis Connected");
});

redis.on("error", (error) => {
  logger.error(`Redis Error: ${error.message}`);
});

export const connectRedis = async () => {
  // ioredis connects automatically.
  // Just return the client.
  return redis;
};

export default redis;
