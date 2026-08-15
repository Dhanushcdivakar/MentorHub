import express from "express";

import validate from "../middlewares/validation.middleware.js";

import {
  createSessionSchema,
  rejectSessionSchema,
  completeSessionSchema,
} from "../validators/session.validator.js";

import {
  createSessionController,
  getSessionController,
  getStudentSessionsController,
  getMentorSessionsController,
  getSessionTimelineController,
  acceptSessionController,
  rejectSessionController,
  completeSessionController,
  cancelSessionController,
} from "../controllers/session.controller.js";

const router = express.Router();

router.post("/", validate(createSessionSchema), createSessionController);

router.get("/student", getStudentSessionsController);

router.get("/mentor", getMentorSessionsController);

router.get("/:id/timeline", getSessionTimelineController);

router.get("/:id", getSessionController);

router.patch("/:id/accept", acceptSessionController);

router.patch(
  "/:id/reject",
  validate(rejectSessionSchema),
  rejectSessionController,
);

router.patch(
  "/:id/complete",
  validate(completeSessionSchema),
  completeSessionController,
);

router.patch("/:id/cancel", cancelSessionController);

export default router;
