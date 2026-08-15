import express from "express";

import {
  getCurrentUser,
  updateCurrentUser,
  getUserProfile,
  getMentors,
  searchUsersController,
  getUserStats,
} from "../controllers/user.controller.js";

import validate from "../middlewares/validation.middleware.js";

import { updateProfileSchema } from "../validators/user.validator.js";

const router = express.Router();

router.get("/me", getCurrentUser);

router.put("/me", validate(updateProfileSchema), updateCurrentUser);

router.get("/mentors", getMentors);

router.get("/search", searchUsersController);

router.get("/stats", getUserStats);

router.get("/:id", getUserProfile);

export default router;
