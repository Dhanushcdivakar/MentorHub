import app from "./app.js";

import { env } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { connectRedis } from "./config/redis.config.js";

import logger from "./config/logger.config.js";

let server;

const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down Books Service...`);

  if (server) {
    server.close(() => {
      logger.info("HTTP Server Closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const startServer = async () => {
  try {
    await connectDB(env.mongoUri);

    await connectRedis();

    server = app.listen(env.port, () => {
      logger.info("=====================================");
      logger.info("📚 Books Service Started");
      logger.info(`Port        : ${env.port}`);
      logger.info(`Environment : ${env.nodeEnv}`);
      logger.info("=====================================");
    });
  } catch (error) {
    console.error(error);

    logger.error(error.stack || error.message || error);

    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();

// Trigger nodemon reload

