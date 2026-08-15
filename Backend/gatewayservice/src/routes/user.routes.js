import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { config } from '../config/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get User Profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 */
router.use(
  '/',
  verifyToken,
  createProxyMiddleware({
    target: config.services.users,
    changeOrigin: true,

    onProxyReq: (proxyReq, req) => {
      console.log('ProxyReq Fired');

      console.log('Gateway User:', req.user);

      proxyReq.setHeader('x-user-id', req.user.id);

      proxyReq.setHeader('x-user-role', req.user.role);
    },
  }),
);

export default router;
