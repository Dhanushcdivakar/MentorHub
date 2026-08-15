import jwt from "jsonwebtoken";

import { env } from "../config/env.config.js";

export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,

    env.jwtSecret,

    {
      expiresIn: env.jwtExpiresIn,
    },
  );
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,

    env.refreshSecret,

    {
      expiresIn: env.refreshExpiresIn,
    },
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(
    token,

    env.jwtSecret,
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,

    env.refreshSecret,
  );
};
