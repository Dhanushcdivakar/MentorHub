import amqp from "amqplib";
import { logger } from "./logger.config.js";

let channel;

export const connectRabbitMQ = async (retries = 5, delay = 5000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);

      channel = await connection.createChannel();

      await channel.assertExchange("mentorhub.exchange", "topic", {
        durable: true,
      });

      logger.info("RabbitMQ Connected successfully to userservice");

      connection.on("error", (err) => {
        logger.error(`RabbitMQ connection error in userservice: ${err.message}`);
      });

      connection.on("close", () => {
        logger.warn("RabbitMQ connection closed in userservice. Reconnecting in 5s...");
        setTimeout(() => connectRabbitMQ(5, 5000), 5000);
      });

      return channel;
    } catch (error) {
      logger.error(`RabbitMQ Connection Attempt ${i} Failed: ${error.message}`);
      if (i === retries) {
        logger.error("Max RabbitMQ connection retries reached. Throwing error...");
        throw error;
      }
      logger.info(`Retrying RabbitMQ in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ Channel Not Initialized");
  }

  return channel;
};
