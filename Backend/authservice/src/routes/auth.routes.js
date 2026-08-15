import express from "express";

import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  forgotPasswordController,
  resetPasswordController,
  googleLoginController,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.get("/me", protect, getMe);

router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);

router.post("/logout", validate(logoutSchema), logout);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController);

router.post("/reset-password", validate(resetPasswordSchema), resetPasswordController);

router.post("/google", validate(googleLoginSchema), googleLoginController);

export default router;
