const R = require('ramda')
const expressionFactory = require('./expression').factory

const handlers = [
  {
    key: 'exp',
    handler: expressionFactory
  }
]


const factory = (tableNameDef) => {
  if (typeof (tableNameDef) === 'string') {
    return R.always(tableNameDef)
  }

  const registeredHandler = handlers.find(t =>
    tableNameDef[t.key] !== undefined
  );

  return registeredHandler.handler(tableNameDef[registeredHandler.key])

}

module.exports = factory