import winston from 'winston';
import path from 'path';
import fs from 'fs';

const defaultLogFile = 'logs/tabletamer.log';
const centralizedLogFile = process.env.LOG_FILE_PATH || defaultLogFile;

// Ensure the log directory exists
const centralizedLogDir = path.dirname(centralizedLogFile);
if (!fs.existsSync(centralizedLogDir)) {
  fs.mkdirSync(centralizedLogDir, { recursive: true });
}

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'tabletamer' },
  transports: [
    new winston.transports.File({ filename: centralizedLogFile }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(({ level, message, timestamp, stack, service }) => {
        let logMsg = `${timestamp} ${level} [${service}]: ${message}`;
        if (stack) logMsg += `\n${stack}`;
        return logMsg;
      })
    ),
  }));
}

export default logger;
