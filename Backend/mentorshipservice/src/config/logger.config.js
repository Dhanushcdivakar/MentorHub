import winston from "winston";

export const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${level}: [${timestamp}] ${message}`,
    ),
  ),

  transports: [new winston.transports.Console()],
});
