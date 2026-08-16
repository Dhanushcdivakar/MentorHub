import express from "express";
import cors from "cors";

import sessionRoutes from "./routes/session.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import meetingRoutes from "./routes/meeting.routes.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import aiChatRoutes from "./routes/aiChat.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(express.json());

app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "mentorship-service",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Mentorship Service is online",
  });
});

app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiChatRoutes);

app.use(globalErrorHandler);

export default app;
