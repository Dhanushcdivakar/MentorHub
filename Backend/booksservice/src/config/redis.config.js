import Redis from "ioredis";

import { env } from "./env.config.js";
import logger from "./logger.config.js";

const isRemote = env.redisUrl || (env.redisHost && env.redisHost !== "127.0.0.1" && env.redisHost !== "localhost");

const redis = env.redisUrl
  ? new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    })
  : new Redis({
      host: env.redisHost,
      port: env.redisPort,
      password: env.redisPassword || undefined,
      tls: isRemote ? {} : undefined,
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
