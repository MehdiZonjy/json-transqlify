const upsertLoader = require('./upsert-loader')
const preConditions = require('../../pre-conditions')
const transformers = require('../../transformers')
const tableNameFactory = require('../../table-name').factory

jest.mock('../../pre-conditions', () => ({
  factory: jest.fn()
}))

jest.mock('../../transformers', () => ({
  factory: jest.fn()
}))

jest.mock('../../table-name', () => ({
  factory: jest.fn()
}))

describe('upsert-loader', () => {
  it('should parse definition and apply preconditions, transform and upsert record', async () => {
    const insertId = 1
    const $conn = {
      query: jest.fn().mockReturnValueOnce(Promise.resolve({ insertId }))
    }
    const $entity = { name: 'john smith' }
    const transformedObj = { fname: 'john', lname: 'smith' }
    const $history = { preInsert: 'test' }
    const transformDef = {}
    const preConditionDef = {}
    const tableNameDef = '$entity.table'
    const tableName = 'users'
    const label = 'InsertUser'
    const primaryKey = 'id'

    const preconditionsHandler = jest.fn().mockReturnValueOnce(Promise.resolve(true))
    preConditions.factory.mockReturnValueOnce(preconditionsHandler)

    const transformerHandler = jest.fn().mockReturnValueOnce(Promise.resolve(transformedObj))
    transformers.factory.mockReturnValueOnce(transformerHandler)

    const getTableName = jest.fn()
      .mockReturnValueOnce(tableName)
    tableNameFactory.mockReturnValueOnce(getTableName)

    await expect(upsertLoader({
      tableName: tableNameDef,
      label,
      primaryKey,
      transform: transformDef,
      on: preConditionDef
    })($entity, $history, $conn)).resolves.toEqual({
      [label]: {
        $insertedId: insertId,
        ...transformedObj
      }
    })

    expect(preConditions.factory).toBeCalledWith(preConditionDef)
    expect(transformers.factory).toBeCalledWith(transformDef)

    expect(transformerHandler).toBeCalledWith({ $entity, $history, $conn })
    expect(preconditionsHandler).toBeCalledWith({$entity, $history, $conn})
    
    expect(getTableName).toHaveBeenCalledTimes(1)
    expect(getTableName).toHaveBeenCalledWith({ $entity, $history, $conn, $source: $entity.items })

    const query = `
      INSERT INTO ${tableName} (fname,lname) VALUES (?,?)
      ON DUPLICATE KEY UPDATE fname = VALUES(fname),lname = VALUES(lname),id = LAST_INSERT_ID(id)
    `
    expect($conn.query).toBeCalledWith(query, [transformedObj.fname, transformedObj.lname])

  })

  it('should resolve to empty object if preconditions fail', async () => {
    const $conn = {
      query: jest.fn().mockReturnValueOnce()
    }
    const $entity = { name: 'test user' }
    const $history = { preInsert: 'test' }
    const transformDef = {}
    const preConditionDef = {}
    const tableName = 'users'
    const label = 'InsertUser'

    const preconditionsHandler = jest.fn().mockReturnValueOnce(Promise.resolve(false))
    preConditions.factory.mockReturnValueOnce(preconditionsHandler)

    const transformerHandler = jest.fn()
    transformers.factory.mockReturnValueOnce(transformerHandler)
    tableNameFactory.mockReturnValueOnce(jest.fn().mockReturnValueOnce(tableName))

    await expect(upsertLoader({
      tableName,
      label,
      transform: transformDef,
      on: preConditionDef
    })($entity, $history, $conn)).resolves.toEqual({})

    expect(preConditions.factory).toBeCalledWith(preConditionDef)
    expect(transformers.factory).toBeCalledWith(transformDef)

    expect(transformerHandler).toHaveBeenCalledTimes(0)
    expect(preconditionsHandler).toBeCalledWith({$entity, $history, $conn})
    expect($conn.query).toHaveBeenCalledTimes(0)

  })
  it('should reject if insertion fails', async () => {
    const error = new Error()
    const conn = {
      query: jest.fn().mockReturnValueOnce(Promise.reject(error))
    }
    const entity = { name: 'john smith' }
    const transformedObj = { fname: 'john', lname: 'smith' }
    const history = { preInsert: 'test' }
    const transformDef = {}
    const preConditionDef = {}
    const tableName = 'users'
    const label = 'InsertUser'

    preConditions.factory.mockReturnValueOnce(jest.fn().mockReturnValueOnce(Promise.resolve(true)))
    transformers.factory.mockReturnValueOnce(jest.fn().mockReturnValueOnce(Promise.resolve(transformedObj)))
    tableNameFactory.mockReturnValueOnce(jest.fn().mockReturnValueOnce(tableName))

    await expect(upsertLoader({
      tableName,
      label,
      transform: transformDef,
      on: preConditionDef
    })(entity, history, conn)).rejects.toEqual(error)
  })
})
