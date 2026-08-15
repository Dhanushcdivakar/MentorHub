import express from "express";
import {
  getSessionsController,
  createSessionController,
  getSessionDetailController,
  sendMessageController,
  deleteSessionController,
} from "../controllers/aiChat.controller.js";

const router = express.Router();

router.get("/sessions", getSessionsController);
router.post("/sessions", createSessionController);
router.get("/sessions/:sessionId", getSessionDetailController);
router.post("/sessions/:sessionId/message", sendMessageController);
router.delete("/sessions/:sessionId", deleteSessionController);

export default router;
