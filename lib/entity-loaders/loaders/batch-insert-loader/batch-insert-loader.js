const transformerFactory = require('../../transformers').factory
const preConditionsFactory = require('../../pre-conditions').factory
const R = require('ramda')
const logger = require('../../../logger')
const sourceFactory = require('../../batch-sources')
const filterP = require('../../../common').filterP

const buildColumns = (entity) => `(${R.keys(entity).join(',')})`
const buildValues = (entity, count) => {
  const row = `(${R.values(entity).map(_ => '?').join(',')})`
  return R.repeat(row, count).join(',') 
}

const batchInsert = R.curry(async (table, conn, entities) => {
  try {
    if(entities.length === 0)
      return {}

    const queryParams = R.flatten(R.map(R.values, entities))

    const query = `INSERT INTO ${table} ${buildColumns(entities[0])} VALUES ${buildValues(entities[0], entities.length)}`
    logger.verbose(`query: ${query}`)
    logger.verbose(`values: ${queryParams}`)
    const result = await conn.query(query, queryParams);
    const rows = { $insertedId: result.insertId, items: entities}
    logger.info('inserted records ', rows)
    return rows
  } catch (err) {
    logger.error('batch-insert-loader failed ', err)
    throw err
  }
})

const insertLoader = loaderDef => {
  logger.verbose('creating batch insert loader ', loaderDef)

  const transformer = R.curry(transformerFactory(loaderDef.transform))
  const { tableName, label } = loaderDef
  const preConditions = R.curry(preConditionsFactory(loaderDef.on))
  const batchSource = sourceFactory(loaderDef.source)

  // return (entity, history, conn) =>
  //   R.pipeP(
  //     R.partial(preConditions, [entity, history, conn]),
  //     R.cond([
  //       // pre conditions pass
  //       [R.equals(true), R.pipeP(
  //         R.partial(transformer, [entity, history, conn]),
  //         insert(tableName, conn),
  //         r => ({ [label]: r })
  //       )],
  //       // pre conditions not satisfied 
  //       [R.equals(false), R.always(
  //         Promise.resolve({})
  //       )]
  //     ]))()


  return async (entities, $history, $conn) => {
    console.log('source')
    const source = await batchSource({ $entity: entities, $conn, $history  })
console.log('precondition')
    const fEntities = await filterP(preConditions(R.__, $history, $conn), source)
    console.log('transformer', fEntities)
    const transformedEntities = await Promise.all(fEntities.map(transformer(R.__, $history)))
console.log('batch insert')
    const result = await batchInsert(tableName, $conn, transformedEntities)

    return {...$history, [label]: result}
  }
}

module.exports = insertLoader;