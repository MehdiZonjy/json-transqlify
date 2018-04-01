const batchInsertLoader = require('./batch-insert-loader')
const preConditions = require('../../pre-conditions')
const transformers = require('../../transformers')
const sources = require('../../sources')

jest.mock('../../pre-conditions', () => ({
  factory: jest.fn()
}))

jest.mock('../../transformers', () => ({
  factory: jest.fn()
}))

jest.mock('../../sources', () => ({
  factory: jest.fn()
}))

describe('batch-insert-loader', () => {
  it('should parse definition and apply preconditions, transform and insert records', async () => {
    const insertId = 1
    const $conn = {
      query: jest.fn().mockReturnValueOnce(Promise.resolve({ insertId }))
    }
    const $entity = {
      items: [
        { name: 'Fname1 Lname1' },
        { name: 'Fname2 Lname2' },
        { name: 'Fname3 Lname3' }
      ]
    }
    const transformedObjs = [
      { fname: 'Fname1', lname: 'Lname1' },
      { fname: 'Fname3', lname: 'Lname3' }
    ]

    const $history = { preInsert: 'test' }
    const transformDef = {}
    const preConditionDef = {}
    const tableName = 'users'
    const label = 'InsertUsers'
    const sourceDef = '$entity'


    const preconditionsHandler = jest.fn()
      .mockReturnValueOnce(Promise.resolve(true))
      .mockReturnValueOnce(Promise.resolve(false))
      .mockReturnValueOnce(Promise.resolve(true))
    preConditions.factory.mockReturnValueOnce(preconditionsHandler)

    const transformerHandler = jest.fn()
      .mockReturnValueOnce(Promise.resolve(transformedObjs[0]))
      .mockReturnValueOnce(Promise.resolve(transformedObjs[1]))
    transformers.factory.mockReturnValueOnce(transformerHandler)

    const sourceHandler = jest.fn()
      .mockReturnValueOnce($entity.items)
    sources.factory.mockReturnValueOnce(sourceHandler)

    await expect(batchInsertLoader({
      tableName,
      label,
      transform: transformDef,
      source: sourceDef,
      on: preConditionDef
    })($entity, $history, $conn)).resolves.toEqual({
      [label]: {
        $insertedId: insertId,
        items: transformedObjs
      }
    })

    expect(preConditions.factory).toBeCalledWith(preConditionDef)
    expect(transformers.factory).toBeCalledWith(transformDef)
    expect(sources.factory).toBeCalledWith(sourceDef)

    expect(transformerHandler).toBeCalledWith({ $entity: $entity.items[0], $history, $conn, $source: $entity.items, $root: $entity, $index: 0 })
    expect(transformerHandler).toBeCalledWith({ $entity: $entity.items[2], $history, $conn, $source: $entity.items, $root: $entity, $index: 2 })

    expect(preconditionsHandler).toBeCalledWith({ $entity: $entity.items[0], $history, $conn, $source: $entity.items, $root: $entity, $index: 0 })
    expect(preconditionsHandler).toBeCalledWith({ $entity: $entity.items[1], $history, $conn, $source: $entity.items, $root: $entity, $index: 1 })
    expect(preconditionsHandler).toBeCalledWith({ $entity: $entity.items[2], $history, $conn, $source: $entity.items, $root: $entity, $index: 2 })


    expect($conn.query).toBeCalledWith(`INSERT INTO ${tableName} (fname,lname) VALUES (?,?),(?,?)`,
      [transformedObjs[0].fname, transformedObjs[0].lname, transformedObjs[1].fname, transformedObjs[1].lname])

  })

  it('should resolve to empty object if preconditions fail', async () => {
    const conn = {
      query: jest.fn().mockReturnValueOnce()
    }
    const $entity = {
      items: [
        { name: 'Fname1 Lname1' },
        { name: 'Fname2 Lname2' },
        { name: 'Fname3 Lname3' }
      ]
    }
    const history = { preInsert: 'test' }
    const transformDef = {}
    const preConditionDef = {}
    const tableName = 'users'
    const label = 'InsertUser'
    const sourceDef = '$entity.items'

    const preconditionsHandler = jest.fn()
      .mockReturnValueOnce(Promise.resolve(false))
      .mockReturnValueOnce(Promise.resolve(false))
      .mockReturnValueOnce(Promise.resolve(false))
    preConditions.factory.mockReturnValueOnce(preconditionsHandler)

    const transformerHandler = jest.fn()
    transformers.factory.mockReturnValueOnce(transformerHandler)


    const sourceHandler = jest.fn()
      .mockReturnValueOnce($entity.items)
    sources.factory.mockReturnValueOnce(sourceHandler)

    await expect(batchInsertLoader({
      tableName,
      label,
      source: sourceDef,
      transform: transformDef,
      on: preConditionDef
    })($entity, history, conn)).resolves.toEqual({ [label]: { items: [] } })

    expect(preConditions.factory).toBeCalledWith(preConditionDef)
    expect(transformers.factory).toBeCalledWith(transformDef)

    expect(transformerHandler).toHaveBeenCalledTimes(0)
    expect(preconditionsHandler).toHaveBeenCalledTimes(3)
    expect(conn.query).toHaveBeenCalledTimes(0)

  })

  it('should reject if insertion fails', async () => {
    const error = new Error()
    const conn = {
      query: jest.fn().mockReturnValueOnce(Promise.reject(error))
    }
    const $entity = {
      items: [
        { name: 'Fname1 Lname1' },
        { name: 'Fname2 Lname2' },
        { name: 'Fname3 Lname3' }
      ]
    }
    const transformedObj = { fname: 'john', lname: 'smith' }
    const history = { preInsert: 'test' }
    const transformDef = {}
    const preConditionDef = {}
    const tableName = 'users'
    const label = 'InsertUser'
    const sourceDef = '$entity.items'

    preConditions.factory.mockReturnValueOnce(jest.fn().mockReturnValueOnce(Promise.resolve(true)))
    transformers.factory.mockReturnValueOnce(jest.fn().mockReturnValueOnce(Promise.resolve(transformedObj)))

    const sourceHandler = jest.fn()
      .mockReturnValueOnce($entity.items)
    sources.factory.mockReturnValueOnce(sourceHandler)


    await expect(batchInsertLoader({
      tableName,
      label,
      source: sourceDef,
      transform: transformDef,
      on: preConditionDef
    })($entity, history, conn)).rejects.toEqual(error)
  })
})
