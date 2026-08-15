import app from "./app.js";

import { connectDB } from "./config/db.config.js";
import { connectRedis } from "./config/redis.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.config.js";
import { consumeEmailNotifications } from "./consumers/email.consumer.js";

import { env } from "./config/env.config.js";

const startServer = async () => {
  try {
    await connectDB(env.mongoUri);
    await connectRedis();
    await connectRabbitMQ();

    // Start consuming email notification events
    await consumeEmailNotifications();

    app.listen(env.port, () => {
      console.log(`Auth Service Running On Port ${env.port}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();

// Trigger nodemon reload (force update 3)

