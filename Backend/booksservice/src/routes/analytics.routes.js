import express from "express";

import * as analyticsController from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/trending", analyticsController.getTrending);

router.get("/top-rated", analyticsController.getTopRated);

router.get("/most-viewed", analyticsController.getMostViewed);

router.get("/most-downloaded", analyticsController.getMostDownloaded);

export default router;
