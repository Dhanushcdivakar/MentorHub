import express from "express";

import {
  getStudentDashboardController,
  getMentorDashboardController,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/student", getStudentDashboardController);

router.get("/mentor", getMentorDashboardController);

export default router;
