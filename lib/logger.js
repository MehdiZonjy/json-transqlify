const winston = require('winston')

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});
logger.level = "info"
const setLogLevel = level => logger.level = level;
logger.setLogLevel = setLogLevel;

module.exports = logger