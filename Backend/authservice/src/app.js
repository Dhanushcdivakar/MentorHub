import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";

import { requestLogger } from "./middlewares/requestLogger.middleware.js";

import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cookieParser());


app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);


app.use(express.json());

app.use(requestLogger);

app.use("/api/auth", authRoutes);

app.use(globalErrorHandler);

export default app;
