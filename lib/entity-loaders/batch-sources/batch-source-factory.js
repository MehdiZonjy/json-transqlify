const expressionFactory = require('./expression').factory



const factory = (def) => {
  if (typeof (def) === 'string') {
    return expressionFactory(def)
  }
}

module.exports = factory