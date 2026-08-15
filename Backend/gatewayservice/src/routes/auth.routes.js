import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config/index.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register User
 *     tags:
 *       - Auth
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.use(
  '/',
  authRateLimiter,
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
  }),
);

export default router;
