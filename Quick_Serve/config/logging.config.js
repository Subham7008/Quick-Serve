const winston = require('winston');
const path = require('path');

const logConfig = {
  development: {
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
  },
  production: {
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 10,
      }),
    ],
    // Additional production settings
    handleExceptions: true,
    handleRejections: true,
    exitOnError: false,
  },
};

module.exports = logConfig[process.env.NODE_ENV || 'development'];