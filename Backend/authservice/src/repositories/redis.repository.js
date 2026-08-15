import redisClient from "../config/redis.config.js";

export const saveRefreshToken = async (userId, token) => {
  await redisClient.set(`refresh:${userId}`, token, {
    EX: 7 * 24 * 60 * 60,
  });
};

export const getRefreshToken = async (userId) => {
  return await redisClient.get(`refresh:${userId}`);
};

export const deleteRefreshToken = async (userId) => {
  return await redisClient.del(`refresh:${userId}`);
};

export const saveResetToken = async (token, email) => {
  await redisClient.set(`reset:${token}`, email, {
    EX: 3600, // 1 hour expiration
  });
};

export const getEmailFromResetToken = async (token) => {
  return await redisClient.get(`reset:${token}`);
};

export const deleteResetToken = async (token) => {
  return await redisClient.del(`reset:${token}`);
};

