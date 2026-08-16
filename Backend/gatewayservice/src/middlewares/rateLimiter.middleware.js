import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

// Global rate limiter: applies to all incoming API requests (e.g. 200 requests per 15 minutes per IP)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for active single-page app loading
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(
      new AppError(
        'Too many requests from this IP. Please try again after 15 minutes',
        429,
      ),
    );
  },
});

// Stricter rate limiter for authentication routes to prevent brute-force attacks
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased to support Google OAuth validation redirect rounds safely
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new AppError(
        'Too many authentication attempts. Please try again after 15 minutes',
        429,
      ),
    );
  },
});
