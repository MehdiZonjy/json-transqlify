const insertLoader = require('./insert-loader')
const updateLoader = require('./update-loader')
const upsertLoader = require('./upsert-loader')
const batchInsertLoader = require('./batch-insert-loader')

const loaders = [
    {
        key: 'insert',
        loader: insertLoader
    },
    {
        key: 'update',
        loader: updateLoader
    },
    {
        key: 'upsert',
        loader: upsertLoader
    },
    {
        key: 'batchInsert',
        loader: batchInsertLoader
    }
]

const loadersFactory  = loaderDef => {
    const registeredLoader = loaders.find(t => 
        loaderDef[t.key] !== undefined
    );
    return registeredLoader.loader(loaderDef[registeredLoader.key])
}

module.exports.factory = loadersFactory;