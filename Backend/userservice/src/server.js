import app from "./app.js";

import { connectDB } from "./config/db.config.js";

import { config } from "./config/env.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.config.js";

import { consumeUserCreated } from "./consumers/userCreated.consumer.js";

const startServer = async () => {
  try {
    await connectDB();
    await connectRabbitMQ();

    await consumeUserCreated();

    app.listen(config.port, () => {
      console.log(`User Service Running On Port ${config.port}`);
    });
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

startServer();

// Trigger nodemon reload

