const _ = require('lodash')
const R = require('ramda')

const source = (def) => async ({ $entity, $source, $history }) => {
  return eval(def)
}

module.exports = source