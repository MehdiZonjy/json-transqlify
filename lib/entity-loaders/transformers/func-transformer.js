const common = require('../../common');
const logger = require('../../logger');
const funcTransformer = funcDef => {
    logger.verbose(`func transformer ${funcDef}`)
    const func = common.requireFile(funcDef)
    return ($entity, $history, $conn) => func({$entity, $history, $conn});
}
module.exports.transformer = funcTransformer;