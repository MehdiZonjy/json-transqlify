const Ajv = require('ajv');
const validatorSchema = require('./validator-schema');
const loadersSchema = require('./loaders-schema')
const ajv = new Ajv();


const schemaV0_1 = {
  type: "object",
  properties: {
    version: {
      enum: [1.0]
    },
    validator: { $ref: validatorSchema.validatorId },
    loaders: { $ref: loadersSchema.loadersId }
  },
  required: [
    "version", "loaders"
  ]
}

validatorSchema.register(ajv)
loadersSchema.register(ajv)

const validator = ajv.compile(schemaV0_1);

const validateDefinition = (definition) => {
  if (validator(definition)) {
    return true;
  }
  else {
    throw new Error(ajv.errorsText(validator.errors));
  }
}

module.exports = validateDefinition;