const common = require('../common')

const loadFuncValidator = (fileDef) => {
  const func = common.requireFile(fileDef)
  return $entity => func($entity);
}

module.exports.validator = loadFuncValidator