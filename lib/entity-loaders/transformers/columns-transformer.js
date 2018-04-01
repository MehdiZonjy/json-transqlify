
const _ = require('lodash');
const logger = require('../../logger')

const columnsTransformer = columnsMapping => async ({ $entity, $history, $index, $root, $source, $key}) => {
    logger.verbose('columns transformer $entity: ', $entity)
    logger.verbose('columns transformer $history: ', $history)
    logger.verbose('columns transformer $index: ', $index)
    logger.verbose('columns transformer $root: ', $root)
    logger.verbose('columns transformer $source: ', $source)
    logger.verbose('columns transformer $key: ', $key)

    return columnsMapping.reduce( (columns, colDef) => {
        columns[colDef.column] = eval(colDef.value);
        return columns;
    }, {})
};


module.exports.transformer = columnsTransformer;