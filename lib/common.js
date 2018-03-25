const path = require('path');
const yaml = require('yamljs');
const logger = require('./logger')

const truthy = () => Promise.resolve(true);
const falsy = () => Promise.resolve(false);

const requireFile = (file) => {
  const mainDir = path.dirname(require.main.filename);
  return require(path.join(mainDir, file));
}

const resolvePathToAbs = (file) => {
  if (path.isAbsolute(file)) {
    return file;
  }
  else {
    return path.join(path.dirname(require.main.filename), file);
  }
}

const loadYaml = file => yaml.load(file)  
const throwError = e => () => { throw e }

const logAndThrow = (m, e) => () => {
  logger.error(m, e);
  throw e;
}

module.exports = {
  truthy,
  falsy,
  requireFile,
  resolvePathToAbs,
  throwError,
  throwError,
  loadYaml,
  logAndThrow
}
