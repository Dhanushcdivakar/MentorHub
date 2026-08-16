import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";

import { requestLogger } from "./middlewares/requestLogger.middleware.js";

import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);


app.use(express.json());

app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "user-service",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User Service is online",
  });
});

app.use("/api/users", userRoutes);

app.use(globalErrorHandler);

export default app;
