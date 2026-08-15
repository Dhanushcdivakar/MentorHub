import express from "express";

import * as reviewController from "../controllers/review.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/review.validator.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validate(createReviewSchema),
  reviewController.addReview,
);

router.get("/:resourceId", reviewController.getReviews);

router.put(
  "/:id",
  authMiddleware,
  validate(updateReviewSchema),
  reviewController.updateReview,
);

router.delete("/:id", authMiddleware, reviewController.deleteReview);

export default router;
