import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  // JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or missing token',
    });
  }

  // AppError
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // fallback
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
