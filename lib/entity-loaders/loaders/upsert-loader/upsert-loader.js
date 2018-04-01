const transformerFactory = require('../../transformers').factory
const preConditionsFactory = require('../../pre-conditions').factory
const R = require('ramda')
const _ = require('lodash')
const logger = require('../../../logger')
const tableNameFactory = require('../../table-name').factory

const execUpsert = async (table, primaryKey, conn, transformedEntity) => {
  try {
    const values = R.values(transformedEntity)
    const onDuplicateUpdate = _.reduce(transformedEntity, (r, v, k) => {
      r.push(`${k} = VALUES(${k})`)
      return r
    }, [])
    if (primaryKey) {
      onDuplicateUpdate.push(`${primaryKey} = LAST_INSERT_ID(${primaryKey})`)
    }

    const query = `
      INSERT INTO ${table} (${R.keys(transformedEntity).join(',')}) VALUES (${values.map(_ => '?').join(',')})
      ON DUPLICATE KEY UPDATE ${onDuplicateUpdate.join(',')}
    `
    logger.verbose(`query: ${query}`)
    logger.verbose(`values: ${values}`)
    const result = await conn.query(query, values);
    const row = { $insertedId: result.insertId, ...transformedEntity }
    logger.info('upsert record ', row)
    return row
  } catch (err) {
    logger.error('upsert-loader failed ', err)
    throw err
  }
}

const upsertLoader = loaderDef => {
  logger.verbose('creating upsert loader ', loaderDef)

  const transformer = transformerFactory(loaderDef.transform)
  const { label, primaryKey } = loaderDef
  const preConditions = preConditionsFactory(loaderDef.on)
  const getTableName = tableNameFactory(loaderDef.tableName)

  return async ($entity, $history, $conn) => {
    if (!(await preConditions({ $entity, $history, $conn }))) {
      return {}
    }

    const tableName = await getTableName({ $entity, $conn, $history })
    const transformedEntity = await transformer({ $entity, $history, $conn })
    const result = await execUpsert(tableName, primaryKey, $conn, transformedEntity)
    return { [label]: result }
  }
}

module.exports = upsertLoader;