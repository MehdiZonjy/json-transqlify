const customSchemaId = 'json.sqlify/validator/schema'

const customSchema = {
  type: 'object',
  properties: {
    default: { type: 'string' },
    refs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          file: { type: 'string' }
        },
        required: ['id', 'file']
      }
    }
  },
  additionalProperties: false
}

const validatorId = 'json.sqlify/validator'

const validator = {
  type: 'object',
  properties: {
    func: { type: 'string' },
    schema: { $ref: customSchemaId }
  },
  oneOf: [
    { required: ['func'] },
    { required: ['schema'] }
  ],
  additionalProperties: false
}

const register = ajv => {
  ajv.addSchema(customSchema, customSchemaId)
  ajv.addSchema(validator, validatorId)
}

module.exports.register = register;