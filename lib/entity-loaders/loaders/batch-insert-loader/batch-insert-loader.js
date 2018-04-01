const transformerFactory = require('../../transformers').factory
const preConditionsFactory = require('../../pre-conditions').factory
const R = require('ramda')
const logger = require('../../../logger')
const sourceFactory = require('../../batch-sources')
const filterP = require('../../../common').filterP

const columns = (entity) => `(${R.keys(entity).join(',')})`
const values = (entity, count) => {
  const row = `(${R.values(entity).map(_ => '?').join(',')})`
  return R.repeat(row, count).join(',')
}

const batchInsert = async (table, conn, entities) => {
  try {
    if (entities.length === 0) {
      return { items: [] }
    }

    const queryValues = R.flatten(R.map(R.values, entities))

    const query = `INSERT INTO ${table} ${columns(entities[0])} VALUES ${values(entities[0], entities.length)}`
    logger.verbose(`query: ${query}`)
    logger.verbose(`values: ${queryValues}`)
    const result = await conn.query(query, queryValues);
    const rows = { $insertedId: result.insertId, items: entities }
    logger.info('inserted records ', rows)
    return rows
  } catch (err) {
    logger.error('batch-insert-loader failed ', err)
    throw err
  }
}

const loader = loaderDef => {
  logger.verbose('creating batch insert loader ', loaderDef)

  const transformer = R.curry(transformerFactory(loaderDef.transform))
  const { tableName, label } = loaderDef
  const preConditions = R.curry(preConditionsFactory(loaderDef.on))
  const batchSource = sourceFactory(loaderDef.source)

  return async ($entity, $history, $conn) => {
    const $source = await batchSource({ $entity, $conn, $history })

    const fEntities = await filterP(preConditions(R.__, $history, $conn), $source)

    const transformedEntities = await Promise.all(fEntities.map(
      (e, $index) => transformer({ $conn, $entity: e, $history, $index, $root: $entity, $source })))

    const result = await batchInsert(tableName, $conn, transformedEntities)
    return { ...$history, [label]: result }
  }
}

module.exports = loader;