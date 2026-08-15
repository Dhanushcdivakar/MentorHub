import { logger } from "../config/logger.config.js";

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",

    message: err.message,

    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",

    message: err.message || "Something went wrong",
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  logger.error(err.message);

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  }

  sendErrorProd(err, res);
};
