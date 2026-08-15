import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import resourceRoutes from "./routes/resource.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

import requestLogger from "./middlewares/requestLogger.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import notFound from "./middlewares/notFound.middleware.js";

const app = express();

/**
 * Security
 */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

/**
 * CORS
 */
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

/**
 * Compression
 */
app.use(compression());

/**
 * Body Parsers
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Request Logger
 */
app.use(requestLogger);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/health", healthRoutes);
/**
 * Health Check
 */

/**
 * API Routes
 */
app.use("/api/resources", resourceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);

/**
 * 404 Handler
 */
app.use(notFound);

app.use(errorMiddleware);

export default app;
