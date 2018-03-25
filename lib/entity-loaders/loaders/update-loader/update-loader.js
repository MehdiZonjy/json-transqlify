const transformerFactory = require('../../transformers').factory
const preConditionsFactory = require('../../pre-conditions').factory
const R = require('ramda')
const logger = require('../../../logger')
const updateConditionsFactory = require('./update-where-conditions').factory



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

  const updateConditions = updateConditionsFactory(loaderDef.where);
  const transformer = transformerFactory(loaderDef.transform)
  const { tableName, label } = loaderDef
  const preConditions = preConditionsFactory(loaderDef.on)


  const runUpdate = (obj, history, conn) =>
    transformer(obj, history, conn)
      .then(t => updateConditions(obj, history, t)
        .then(w => ([t, w])))
      .then(([t, w]) => update(tableName, conn, w, t))

  return (obj, history, conn) =>
    R.pipeP(
      R.partial(preConditions, [obj, history, conn]),
      R.cond([
        // pre conditions pass
        [R.equals(true), R.pipeP(
          R.partial(runUpdate, [obj, history, conn]),
          r => ({ [label]: r })
        )],
        // pre conditions not satisfied 
        [R.equals(false), R.always(
          Promise.resolve({})
        )]
      ]))()
}

module.exports = insertLoader;