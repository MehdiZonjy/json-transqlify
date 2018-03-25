const common = require('../common')
const schemaValidator = require('./schema-validator');
const funcValidator = require('./func-validator')

const validators = [
  { key: 'func', validator: funcValidator.validator },
  { key: 'schema', validator: schemaValidator.validator }
]

const loadValidator = (validatorDef = {}) => {
  const registeredValidator = validators.find(v =>
    validatorDef[v.key] !== undefined
  ) || { key: '', validator: () => common.truthy };


  return registeredValidator.validator(validatorDef[registeredValidator.key])
}

module.exports = loadValidator;