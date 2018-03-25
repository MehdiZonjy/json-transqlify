const common = require('../../common')
const logger = require('../../logger')

const funcCondition = (fileDef) => {
  const func = common.requireFile(fileDef)
  return ($entity, $history, conn) => {
    try{
      logger.verbose(`func precondition: ${fileDef}`)
      logger.verbose('$entity: ', $entity)
      logger.verbose('$history: ', $history)
      const result = func({ $entity, $history, conn });
      logger.info(`func precondtion ${fileDef}: ${result}`)
      return result
    }catch (e) {
      logger.error(`func precondition ${fileDef}`)
      logger.error(e)
      throw e
    }

  }
}

module.exports.condition = funcCondition