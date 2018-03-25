const createFactory = require('./transqlifier-factory')
const logger = require('./logger')

module.exports = {
  createFactory,
  setLogLevel: logger.setLogLevel
}
