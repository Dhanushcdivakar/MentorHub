import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { verifyToken } from '../middlewares/auth.middleware.js';
import { config } from '../config/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 */
router.use(
  '/',
  verifyToken,
  createProxyMiddleware({
    target: config.services.books,
    changeOrigin: true,
    pathRewrite: {
      '^/api/books': '/api', // Strips "/api/books" and replaces it with "/api"
    },
  }),
);

export default router;
