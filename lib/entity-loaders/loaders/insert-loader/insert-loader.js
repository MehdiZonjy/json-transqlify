const transformerFactory = require('../../transformers').factory
const preConditionsFactory = require('../../pre-conditions').factory
const R = require('ramda')
const logger = require('../../../logger')

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
  const { tableName, label } = loaderDef
  const preConditions = preConditionsFactory(loaderDef.on)
  return ($entity, $history, $conn) =>
    R.pipeP(
      R.partial(preConditions, [{ $entity, $history, $conn }]),
      R.cond([
        // pre conditions pass
        [R.equals(true), R.pipeP(
          R.partial(transformer, [{ $entity, $history, $conn }]),
          insert(tableName, $conn),
          r => ({ [label]: r })
        )],
        // pre conditions not satisfied 
        [R.equals(false), R.always(
          Promise.resolve({})
        )]
      ]))()
}

module.exports = insertLoader;