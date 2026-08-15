import express from "express";

import * as resourceController from "../controllers/resource.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import {
  createResourceSchema,
  updateResourceSchema,
} from "../validators/resource.validator.js";

const router = express.Router();

const parseFormData = (req, res, next) => {
  if (req.body.estimatedReadTime !== undefined) {
    req.body.estimatedReadTime = parseInt(req.body.estimatedReadTime, 10) || 0;
  }
  if (req.body.tags) {
    if (typeof req.body.tags === "string") {
      req.body.tags = req.body.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (!Array.isArray(req.body.tags)) {
      req.body.tags = [req.body.tags];
    }
  }
  next();
};

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  resourceController.uploadSingleFile,
);

router.post(
  "/",
  authMiddleware,
  authorize("ADMIN", "MENTOR"),
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "resourceFile",
      maxCount: 1,
    },
  ]),
  parseFormData,
  validate(createResourceSchema),
  resourceController.createResource,
);

router.get("/", resourceController.getResources);
router.get("/:id/download", resourceController.downloadResource);

router.get("/:id", resourceController.getResourceById);

router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "MENTOR"),
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "resourceFile",
      maxCount: 1,
    },
  ]),
  parseFormData,
  validate(updateResourceSchema),
  resourceController.updateResource,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "MENTOR"),
  resourceController.deleteResource,
);

export default router;
