const transformerFactory = require('../../transformers').factory
const preConditionsFactory = require('../../pre-conditions').factory
const R = require('ramda')
const logger = require('../../../logger')
const sourceFactory = require('../../sources').factory
const tableNameFactory = require('../../table-name').factory

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

  const transformer = transformerFactory(loaderDef.transform)
  const { label } = loaderDef
  const preConditions = preConditionsFactory(loaderDef.on)
  const batchSource = sourceFactory(loaderDef.source)
  const getTableName = tableNameFactory(loaderDef.tableName)

  return async ($entity, $history, $conn) => {
    const $source = await batchSource({ $entity, $conn, $history })
    const tableName = await getTableName({$entity, $conn, $source, $conn, $history})

    const fEntities = await Promise.all(
      $source.map((e, $index) => preConditions({ $conn, $entity: e, $history, $index, $root: $entity, $source })))
      .then(R.zip($source))

    const transformedEntities = await Promise.all(fEntities.reduce((r, e, $index) => {
      if (e[1])
        r.push(transformer({ $conn, $entity: e[0], $history, $index, $root: $entity, $source }))
      return r
    }, []))

    const result = await batchInsert(tableName, $conn, transformedEntities)
    return { [label]: result }
  }
}

module.exports = loader;