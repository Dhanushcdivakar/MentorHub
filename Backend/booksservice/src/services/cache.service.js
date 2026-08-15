import redis from "../config/redis.config.js";

export const get = async (key) => {
  const data = await redis.get(key);

  return data ? JSON.parse(data) : null;
};

export const set = async (key, value, ttl = 600) => {
  // ioredis requires positional arguments for options like EX:
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const remove = async (key) => {
  await redis.del(key);
};

export const exists = async (key) => {
  return Boolean(await redis.exists(key));
};

export const flushPattern = async (pattern) => {
  let cursor = "0";

  do {
    // ioredis scan returns [nextCursor, keys] and expects positional MATCH/COUNT arguments:
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      `${pattern}*`,
      "COUNT",
      100
    );

    cursor = nextCursor;

    if (keys && keys.length > 0) {
      await redis.del(keys);
    }
  } while (cursor !== "0");
};

export const flushAll = async () => {
  await redis.flushdb();
};
