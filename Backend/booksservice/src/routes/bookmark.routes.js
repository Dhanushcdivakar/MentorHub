import express from "express";

import * as bookmarkController from "../controllers/bookmark.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import { bookmarkSchema } from "../validators/bookmark.validator.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validate(bookmarkSchema),
  bookmarkController.addBookmark,
);

router.get("/", authMiddleware, bookmarkController.getBookmarks);

router.delete(
  "/:resourceId",
  authMiddleware,
  bookmarkController.removeBookmark,
);

export default router;
