const insertLoader = require('./insert-loader')
const updateLoader = require('./update-loader')
const loaders = [
    {
        key: 'insert',
        loader: insertLoader
    },
    {
        key: 'update',
        loader: updateLoader
    }
]

const loadersFactory  = loaderDef => {
    const registeredLoader = loaders.find(t => 
        loaderDef[t.key] !== undefined
    );
    return registeredLoader.loader(loaderDef[registeredLoader.key])
}

module.exports.factory = loadersFactory;