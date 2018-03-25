const dbCondition = require('./db-condition').condition
const expCondition = require('./exp-condition').condition
const funcCondition = require('./func-condition').condition
const _ = require('lodash')
const R = require('ramda')
const truthy = require('../../common').truthy
const conditionHandlers = [
    {
        key: 'func',
        handler: funcCondition
    },
    {
        key: 'exp',
        handler: expCondition
    },
    {
        key: 'db',
        handler: dbCondition
    }
]

const conditionFactory = conditionDef => {
    const registeredHandler = conditionHandlers.find(t =>
        conditionDef[t.key] !== undefined
    );
    return registeredHandler.handler(conditionDef[registeredHandler.key])
};


const parseConditions = preConditionsDef => {
    const handlers = preConditionsDef && preConditionsDef.length > 0
        ? preConditionsDef.map(conditionDef => conditionFactory(conditionDef))
        : [truthy];
    return (entity, history, conn) =>
        Promise.all(
            handlers.map(handler => handler(entity, history, conn)))
            .then(R.all(R.equals(true)))
}

module.exports.factory = parseConditions