const common = require('../../common');
const logger = require('../../logger');
const funcTransformer = funcDef => {
    logger.verbose(`func transformer ${funcDef}`)
    const func = common.requireFile(funcDef)
    return ({ $entity, $history, $index, $root, $conn, $source }) =>
        func({ $entity, $history, $conn, $index, $root, $source });
}
module.exports.transformer = funcTransformer;