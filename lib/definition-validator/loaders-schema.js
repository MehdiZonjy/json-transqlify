
const columnTransformerId = 'json.sqlify/transform/columns'
const columnTransformer = {
  type: 'array',
  minItems: 1,
  items: {
    type: 'object',
    properties: {
      column: {
        type: 'string'
      },
      value: {
        type: 'string'
      }
    },
    required: ['column', 'value']
  }
}
const transformId = 'json.sqlify/transform'
const transform = {
  type: 'object',
  properties: {
    columns: { $ref: columnTransformerId },
    func: { type: 'string' }
  },
  oneOf: [
    { required: ['columns'] },
    { required: ['func'] }
  ],
  additionalProperties: false
}

const dbPreconditionId = 'json.sqlify/precondition/db'
const dbPrecondition = {
  type: 'object',
  properties: {
    query: { type: 'string' },
    expect: { type: 'string' },
    params: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['query', 'expect']
}

const preconditionId = 'json.sqlify/precondition'
const preconditions = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      exp: { type: 'string' },
      func: { type: 'string' },
      db: { $ref: dbPreconditionId }
    },
    oneOf: [
      { required: ['exp'] },
      { required: ['func'] },
      { required: ['db'] }
    ],
  }
}

const insertId = 'json.sqlify/loaders/insert'

const insert = {
  type: 'object',
  properties: {
    tableName: { type: 'string' },
    label: { type: 'string' },
    transform: { $ref: transformId },
    on: { $ref: preconditionId },
  },
  required: ['tableName', 'label', 'transform'],
  additionalProperties: false
}

const upsertId = 'json.sqlify/loaders/upsert'

const upsert = {
  type: 'object',
  properties: {
    tableName: { type: 'string'},
    label: { type: 'string' },
    primaryKey: { type: 'string' },
    transform: { $ref: transformId },
    on: { $ref: preconditionId}
  },
  required: [ 'tableName', 'label', 'transform' ],
  additionalProperties: false
}

const updateId = 'json.sqlify/loaders/update'
const update = {
  type: 'object',
  properties: {
    tableName: { type: 'string' },
    label: { type: 'string' },
    transform: { $ref: transformId },
    on: { $ref: preconditionId },
    where: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        params: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['query']
    }
  },
  required: ['tableName', 'label', 'transform', 'where'],
  additionalProperties: false
}

const loadersId = 'json.sqlify/loader'

const loaders = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      insert: { $ref: insertId },
      update: { $ref: updateId },
      upsert: { $ref: upsertId }
    },
    oneOf: [
      { required: ['insert'] },
      { required: ['update'] },
      { required: ['upsert'] }
    ],
  }
}

const register = ajv => {
  ajv.addSchema(columnTransformer, columnTransformerId)
  ajv.addSchema(transform, transformId)
  ajv.addSchema(dbPrecondition, dbPreconditionId)
  ajv.addSchema(preconditions, preconditionId)
  ajv.addSchema(insert, insertId)
  ajv.addSchema(update, updateId)
  ajv.addSchema(loaders, loadersId)
  ajv.addSchema(upsert, upsertId)
}

module.exports = { register, loadersId }
