const common = require('./common');
const entityValidator = require('./entity-validators');
const validateDefinition = require('./definition-validator');
const loadersFactory = require('./entity-loaders');
const db = require('./db')

const factory = dbOpts => {
  const pool = db.createPool(dbOpts)

  return {
    createTransqlifier: definitionFile => {
      const definition = common.loadYaml(common.resolvePathToAbs(definitionFile));
      validateDefinition(definition);

      const validator = entityValidator(definition.validator);
      const loaders = loadersFactory(definition.loaders);

      return entity =>
        validator(entity)
          .then(pool.getConnection)
          .then(conn => loaders(entity, conn));
    },
    closePool: pool.close
  }
}

module.exports = factory
