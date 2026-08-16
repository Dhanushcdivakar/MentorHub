import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

import { setupRoutes } from './routes/index.js';
import { morganMiddleware } from './middlewares/logger.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { AppError } from './utils/AppError.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';

const app = express();

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
        callback(null, false); // Don't set header
      }
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);
app.use(morganMiddleware);

// Apply rate limiting to all routes
app.use(globalRateLimiter);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
setupRoutes(app);

// Health
app.get('/', (req, res) => {
  res.send('Gateway Running 🚀');
});

// 404 (USING YOUR AppError)
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
