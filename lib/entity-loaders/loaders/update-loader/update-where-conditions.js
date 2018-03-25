const _ = require('lodash')
const whereConditions = whereDef => ($entity, $history, $transform) =>
  Promise.resolve({
    query: whereDef.query,
    params: whereDef.params.map(p => eval(p))
  })

module.exports.factory = whereConditions;