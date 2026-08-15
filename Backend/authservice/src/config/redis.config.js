import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Connection Error:", err);
});

export const connectRedis = async () => {
  await redisClient.connect();

  console.log("Redis Connected");
};

export default redisClient;
