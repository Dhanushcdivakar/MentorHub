import express from "express";

import { getMeetingController } from "../controllers/meeting.controller.js";

const router = express.Router();

router.get("/:sessionId", getMeetingController);

export default router;
