import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
  findUserById,
  updateUserPassword,
} from "../repositories/auth.repository.js";
import { publishUserCreated } from "../producers/userCreated.producer.js";
import { publishUserLogin } from "../producers/userLogin.producer.js";

import {
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  saveResetToken,
  getEmailFromResetToken,
  deleteResetToken,
} from "../repositories/redis.repository.js";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/email.util.js";


import { AppError } from "../utils/AppError.js";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.config.js";

import {
  hashPassword,
  comparePassword,
  hashToken,
  compareToken,
} from "../utils/password.util.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.util.js";

export const registerUser = async (userData) => {
  const existingUser = await findUserByEmail(userData.email);

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await hashPassword(userData.password);

  const user = await createUser({
    ...userData,
    password: hashedPassword,
  });
  await publishUserCreated(user);

  return user;
};

export const loginUser = async (email, password) => {
  const user = await findUserByEmailWithPassword(email);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  const hashedRefreshToken = await hashToken(refreshToken);

  await saveRefreshToken(user._id, hashedRefreshToken);
  await publishUserLogin(user);
  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 401);
  }

  const decoded = verifyRefreshToken(refreshToken);

  const storedToken = await getRefreshToken(decoded.id);

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  const isValid = await compareToken(refreshToken, storedToken);

  if (!isValid) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await findUserById(decoded.id);

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  return {
    accessToken,
  };
};

export const logoutUser = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  await deleteRefreshToken(decoded.id);

  return true;
};

export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("No account found with this email address", 404);
  }

  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");

  // Save the token mapping to email in Redis
  await saveResetToken(token, email);

  // Send the reset email
  await sendResetPasswordEmail(email, token);

  return true;
};

export const resetPassword = async (token, newPassword) => {
  const email = await getEmailFromResetToken(token);
  if (!email) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password in DB
  await updateUserPassword(email, hashedPassword);

  // Delete the token from Redis so it cannot be reused
  await deleteResetToken(token);

  return true;
};

const oauthClient = new OAuth2Client(env.googleClientId);

export const googleLogin = async (idToken) => {
  if (!idToken) {
    throw new AppError("Google ID Token is required", 400);
  }

  let payload;
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error("Google ID Token verification failed:", error);
    throw new AppError("Invalid Google ID Token", 401);
  }

  const { email, name } = payload;

  let user = await findUserByEmail(email);
  let isNewUser = false;

  if (!user) {
    // Automatically register Google user
    const randomPassword = crypto.randomBytes(16).toString("hex") + "A1!";
    const hashedPassword = await hashPassword(randomPassword);

    user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    await publishUserCreated(user);
    isNewUser = true;
  }

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  const hashedRefreshToken = await hashToken(refreshToken);
  await saveRefreshToken(user._id, hashedRefreshToken);
  await publishUserLogin(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    isNewUser,
  };
};


