const transformerFactory = require('../../transformers').factory
const preConditionsFactory = require('../../pre-conditions').factory
const R = require('ramda')
const logger = require('../../../logger')
const tableNameFactory = require('../../table-name').factory

const insert = R.curry(async (table, conn, transformedEntity) => {
  try {
    const values = R.values(transformedEntity)
    const query = `INSERT INTO ${table} (${R.keys(transformedEntity).join(',')}) VALUES (${values.map(_ => '?').join(',')})`
    logger.verbose(`query: ${query}`)
    logger.verbose(`values: ${values}`)
    const result = await conn.query(query, values);
    const row = { $insertedId: result.insertId, ...transformedEntity }
    logger.info('inserted record ', row)
    return row
  } catch (err) {
    logger.error('insert-loader failed ', err)
    throw err
  }
})

const insertLoader = loaderDef => {
  logger.verbose('creating insert loader ', loaderDef)

  const transformer = transformerFactory(loaderDef.transform)
  const { label } = loaderDef
  const getTableName = tableNameFactory(loaderDef.tableName)

  const preConditions = preConditionsFactory(loaderDef.on)
  return async ($entity, $history, $conn) => {
    if (!(await preConditions({ $entity, $history, $conn }))) {
      return {}
    }

    const tableName = await getTableName({ $entity, $conn, $history })
    const transformedEntity = await transformer({ $entity, $history, $conn })
    const result = await insert(tableName, $conn, transformedEntity)
    return { [label]: result }
  }
}

module.exports = insertLoader;