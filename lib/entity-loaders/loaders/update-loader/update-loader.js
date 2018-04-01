const transformerFactory = require('../../transformers').factory
const preConditionsFactory = require('../../pre-conditions').factory
const R = require('ramda')
const logger = require('../../../logger')
const updateConditionsFactory = require('./update-where-conditions').factory
const tableNameFactory = require('../../table-name').factory



const update = R.curry(async (table, conn, where, entity) => {
  try {
    const values = R.concat(R.values(entity), R.values(where.params))
    const query = `
      UPDATE ${table} 
        SET ${R.keys(entity).map(c => c + ' = ?').join(',')}
        WHERE ${where.query}
    `
    logger.verbose(`query: ${query}`)
    logger.verbose(`values: ${values}`)
    const result = await conn.query(query, values);
    const row = { ...entity }
    logger.info('updated record ', row)
    logger.info(`affected rows: ${result.affectedRows}`)
    return row
  } catch (err) {
    logger.error('insert-loader failed ', err)
    throw err
  }
})

const insertLoader = loaderDef => {
  logger.verbose('creating insert loader ', loaderDef)

  const getUpdateConditions = updateConditionsFactory(loaderDef.where);
  const transformer = transformerFactory(loaderDef.transform)
  const { label } = loaderDef
  const preConditions = preConditionsFactory(loaderDef.on)
  const getTableName = tableNameFactory(loaderDef.tableName)


  const runUpdate = (obj, history, conn) =>
    transformer(obj, history, conn)
      .then(t => getUpdateConditions(obj, history, t)
        .then(w => ([t, w])))
      .then(([t, w]) => update(tableName, conn, w, t))

  return async ($entity, $history, $conn) => {
    if (!(await preConditions({ $entity, $history, $conn }))) {
      return {}
    }

    const tableName = await getTableName({ $entity, $conn, $history })
    const transformedEntity = await transformer({ $entity, $history, $conn })
    const updateCondition = await getUpdateConditions(obj, history, transformedEntity)
    const result = await update(tableName, $conn, updateCondition, transformedEntity)
    return { [label]: result }
  }
}

module.exports = insertLoader;