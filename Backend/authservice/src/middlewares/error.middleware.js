import logger from "../config/logger.config.js";

export const globalErrorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
  });

  res.status(err.statusCode || 500).json({
    success: false,

    status: err.status || "error",

    message: err.message || "Internal Server Error",
  });
};
