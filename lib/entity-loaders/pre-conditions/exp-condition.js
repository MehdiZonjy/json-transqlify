const _ = require('lodash');
const logger = require('../../logger')
const expCondition = expDef => {
  logger.verbose(`build exp precondition: ${expDef}`)
  return async ({ $entity, $history, $index, $root, $conn, $source, $key }) => {
    try {
      logger.verbose(`exp precondtion: ${expDef}`)
      logger.verbose(`$obj ${$entity}`)
      logger.verbose(`$history ${$history}`)

      return eval(expDef)
    } catch (e) {
      logger.error('exp condition failed ', e)
      throw e
    }
  }
}


module.exports.condition = expCondition;
