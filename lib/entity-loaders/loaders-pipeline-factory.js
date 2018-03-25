const loadersFactory = require('./loaders/').factory
const R = require('ramda')
const _ = require('lodash')
const logAndThrow = require('../common').logAndThrow

const runLoader = R.curry((loader, obj, conn, history) =>
    loader(obj, history, conn).then(R.merge(history)))


const factory = loadDef => {
    const loaders = R.map(R.pipe(loadersFactory, runLoader), loadDef)// loadDef.map(loadersFactory);

    return ($entity, conn) =>
        conn.beginTransaction()
            .then(R.always(Promise.resolve({})))
            .then(R.pipeP(...R.map(R.partial(R.__, [$entity, conn]), loaders)))
            .then(h => conn.commit().then(R.always(h)))
            .catch( e => conn.rollback(conn).then(logAndThrow('Rolledback transaction due to: ', e)))
}

module.exports = factory;