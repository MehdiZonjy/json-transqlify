const _ = require('lodash')
const logger = require('../../logger')

const dbCondition = dbCondDef => {
  const { query, params } = dbCondDef
  logger.verbose('build db precondition: ', dbCondDef )
  return async ({ $entity, $history, $index, $root, $conn, $source, $key }) => {
    try {
      logger.verbose(`query: ${query}`)
      const values = params.map(e => eval(e))
      logger.verbose(`values: ${values}`)
      const $rows = await $conn.query(query, values)
      logger.verbose(`$rows: ${$rows}`)

      const result = eval(dbCondDef.expect)
      logger.info(`db precondition: ${result}`)
      return result
    } catch (e) {
      logger.error('db precondition failed ', e)
      throw e
    }
  }
}

module.exports.condition = dbCondition;
