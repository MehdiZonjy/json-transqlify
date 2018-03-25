const columnsTransformer = require('./columns-transformer').transformer;
const funcTransformer = require('./func-transformer').transformer;
const _ = require('lodash')
const transformers = [
    {
        key: 'columns',
        transformer: columnsTransformer
    },
    {
        key: 'func',
        transformer: funcTransformer
    }
]

const transformersFactory = transformerDef => {
    const registeredTransformer = transformers.find(t => 
        transformerDef[t.key] !==undefined
    );
    return registeredTransformer.transformer(transformerDef[registeredTransformer.key])
};

module.exports.factory = transformersFactory