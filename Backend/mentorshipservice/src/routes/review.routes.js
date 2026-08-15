import express from "express";

import validate from "../middlewares/validation.middleware.js";

import { addReviewSchema } from "../validators/review.validator.js";

import {
  addReviewController,
  getMentorReviewsController,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/:sessionId", validate(addReviewSchema), addReviewController);

router.get("/mentor/:mentorId", getMentorReviewsController);

export default router;
