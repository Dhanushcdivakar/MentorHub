import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.config.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    error = new ApiError(
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }

  logger.error({
    method: req.method,
    path: req.originalUrl,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
  });

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
  });
};

export default errorMiddleware;
