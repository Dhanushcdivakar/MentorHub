import winston from 'winston';
import debug from 'debug';

const debugLog = debug('app:log');

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export const logDebug = (msg) => {
  debugLog(msg);
  logger.debug(msg);
};
