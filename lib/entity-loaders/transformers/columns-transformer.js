
const _ = require('lodash');
const logger = require('../../logger')

const columnsTransformer = columnsMapping => async ($entity, $history) => {
    logger.verbose('columns transformer $entity: ', $entity)
    logger.verbose('columns transformer $history: ', $history)

    return columnsMapping.reduce( (columns, colDef) => {
        columns[colDef.column] = eval(colDef.value);
        return columns;
    }, {})
};


module.exports.transformer = columnsTransformer;