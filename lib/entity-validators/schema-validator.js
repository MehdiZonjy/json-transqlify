const Ajv = require('ajv');
const _ = require('lodash');
const common = require('../common');
const schemaValidator = (schemaOptions) => {
  const ajv = new Ajv();
  const defaultSchema = common.requireFile(schemaOptions.default);
  const refs = schemaOptions.refs || [];

  _.forEach(refs, ({id, file}) => {
    const refSchema = common.requireFile(file);
    ajv.addSchema(refSchema, id);
  });
  const validator = ajv.compile(defaultSchema);
  return obj => new Promise((resolve, reject) => {
    if(!validator(obj)) {
      reject(ajv.errorsText(validator.errors));
    }
    return resolve(true);
  });

}


module.exports.validator = schemaValidator;
