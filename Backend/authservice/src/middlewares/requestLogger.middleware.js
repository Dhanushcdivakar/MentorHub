import morgan from "morgan";

import logger from "../config/logger.config.js";

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export const requestLogger = morgan(
  "[:date[iso]] :method :url :status :response-time ms",
  {
    stream,
  },
);
