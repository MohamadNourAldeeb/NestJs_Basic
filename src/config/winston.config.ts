import * as winston from 'winston';
import 'winston-daily-rotate-file';

const transports = [
  new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),
];

// if (process.env.NODE_ENV === 'development') {
// const consoleTransportsDebug: any = new winston.transports.Console({
//   level: 'debug',
//   format: winston.format.combine(
//     winston.format.colorize({ all: true }),
//     winston.format.timestamp({ format: 'YYY-MM-DD HH:MM:SS' }),
//   ),
// });

//   transports.push(consoleTransportsDebug);
// }

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});
