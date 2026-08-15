import express from "express";

import * as categoryController from "../controllers/category.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorize("ADMIN"),
  validate(createCategorySchema),
  categoryController.createCategory,
);

router.get("/", categoryController.getCategories);

router.get("/:id", categoryController.getCategoryById);

router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  categoryController.updateCategory,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  categoryController.deleteCategory,
);

export default router;
