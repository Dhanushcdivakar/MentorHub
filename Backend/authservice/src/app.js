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

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].map(url => url ? url.replace(/\/$/, '') : '').filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            const normalizedOrigin = origin.replace(/\/$/, '');
            const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                              normalizedOrigin.startsWith('http://localhost:');
            if (isAllowed) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        credentials: true,
    })
);


app.use(express.json());

app.use(requestLogger);

app.get("/health", (req, res) => {
    res.status(200).json({ success: true, service: "auth-service" });
});

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Auth Service is online" });
});

app.use("/api/auth", authRoutes);

app.use(globalErrorHandler);

export default app;
