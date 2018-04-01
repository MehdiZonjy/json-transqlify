const common = require('../../common');
const logger = require('../../logger');
const funcTransformer = funcDef => {
    logger.verbose(`func transformer ${funcDef}`)
    const func = common.requireFile(funcDef)
    return ({ $entity, $history, $index, $root, $conn, $source, $key }) =>
        func({ $entity, $history, $conn, $index, $root, $source, $key });
}
module.exports.transformer = funcTransformer;