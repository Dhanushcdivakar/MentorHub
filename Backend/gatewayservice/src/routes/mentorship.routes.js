import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { verifyToken } from '../middlewares/auth.middleware.js';
import { config } from '../config/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/mentorship:
 *   get:
 *     summary: Get mentorship resources
 *     tags:
 *       - Mentorship
 *     security:
 *       - bearerAuth: []
 */
router.use(
  '/',
  verifyToken,
  createProxyMiddleware({
    target: config.services.mentorship,
    changeOrigin: true,
    pathRewrite: {
      '^/api/mentorship': '/api', // Strips "/api/mentorship" and replaces it with "/api"
    },
    onProxyReq: (proxyReq, req) => {
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id);
        proxyReq.setHeader('x-user-role', req.user.role);
      }
    },
  }),
);

export default router;
