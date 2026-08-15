import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshUserToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  googleLogin,
} from "../services/auth.service.js";

import { catchAsync } from "../utils/catchAsync.js";

import { ApiResponse } from "../utils/ApiResponse.js";

export const register = catchAsync(async (req, res) => {
  const user = await registerUser(req.body);

  res
    .status(201)
    .json(new ApiResponse(true, "User registered successfully", user));
});

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  setRefreshTokenCookie(res, result.refreshToken);

  // Exclude refreshToken from body
  const { refreshToken, ...responseBody } = result;

  res.status(200).json(new ApiResponse(true, "Login successful", responseBody));
});

export const getMe = catchAsync(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(true, "User fetched successfully", user));
});

export const refreshToken = catchAsync(async (req, res) => {
  // Read from cookie first, fall back to body for testing / API clients
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  const data = await refreshUserToken(token);

  res.status(200).json(new ApiResponse(true, "Token refreshed", data));
});

export const logout = catchAsync(async (req, res) => {
  // Read from cookie first, fall back to body
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (token) {
    await logoutUser(token);
  }

  clearRefreshTokenCookie(res);

  res.status(200).json(new ApiResponse(true, "Logged out successfully"));
});

export const forgotPasswordController = catchAsync(async (req, res) => {
  const { email } = req.body;
  await forgotPassword(email);
  res.status(200).json(new ApiResponse(true, "Password reset instructions sent."));
});

export const resetPasswordController = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  await resetPassword(token, password);
  res.status(200).json(new ApiResponse(true, "Password reset successful."));
});

export const googleLoginController = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const result = await googleLogin(idToken);

  setRefreshTokenCookie(res, result.refreshToken);

  const { refreshToken, ...responseBody } = result;

  res.status(200).json(new ApiResponse(true, "Google login successful", responseBody));
});


