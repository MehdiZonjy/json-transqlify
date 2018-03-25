const common = require('../common')

const loadFuncValidator = (fileDef) => {
  const func = common.requireFile(fileDef)
  return obj => func(obj);
}

module.exports.validator = loadFuncValidator