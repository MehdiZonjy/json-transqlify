const insertLoader = require('./insert-loader')
const preConditions = require('../../pre-conditions')
const transformers = require('../../transformers')

jest.mock('../../pre-conditions', () => ({
    factory: jest.fn()
}))


jest.mock('../../transformers', () => ({
    factory: jest.fn()
}))

describe('insert-loader', () => {
    it('should parse definition and apply preconditions, transform and insert record', async ()=>{
        const insertId = 1
        const conn = {
            query: jest.fn().mockReturnValueOnce(Promise.resolve({insertId}))
        }
        const entity = {name: 'mehdi zonjy'}
        const transformedObj = {fname: 'mehdi', lname: 'zonjy'}
        const history = { preInsert: 'test'}
        const transformDef = {}
        const preConditionDef = {}
        const tableName = 'users'
        const label = 'InsertUser'

        const preconditionsHandler = jest.fn().mockReturnValueOnce(Promise.resolve(true))   
        preConditions.factory.mockReturnValueOnce(preconditionsHandler)

        const transformerHandler = jest.fn().mockReturnValueOnce(Promise.resolve(transformedObj))
        transformers.factory.mockReturnValueOnce(transformerHandler)

        await expect(insertLoader({
            tableName,
            label,
            transform: transformDef,
            on: preConditionDef
        })(entity, history, conn)).resolves.toEqual({
            [label]: {
                $insertedId: insertId,
                ...transformedObj
            }
        })

        expect(preConditions.factory).toBeCalledWith(preConditionDef)
        expect(transformers.factory).toBeCalledWith(transformDef)

        expect(transformerHandler).toBeCalledWith(entity, history, conn, true) // 3rd arg a hack because ramda is pipling precondition result
        expect(preconditionsHandler).toBeCalledWith(entity, history, conn)

        expect(conn.query).toBeCalledWith(`INSERT INTO ${tableName} (fname,lname) VALUES (?,?)`, [transformedObj.fname, transformedObj.lname])

    })

    it('should resolve to empty object if preconditions fail', async () => {
        const conn = {
            query: jest.fn().mockReturnValueOnce()
        }
        const entity = { name: 'test user' }
        const history = { preInsert: 'test' }
        const transformDef = {}
        const preConditionDef = {}
        const tableName = 'users'
        const label = 'InsertUser'

        const preconditionsHandler = jest.fn().mockReturnValueOnce(Promise.resolve(false))
        preConditions.factory.mockReturnValueOnce(preconditionsHandler)

        const transformerHandler = jest.fn()
        transformers.factory.mockReturnValueOnce(transformerHandler)

        await expect(insertLoader({
            tableName,
            label,
            transform: transformDef,
            on: preConditionDef
        })(entity, history, conn)).resolves.toEqual({})

        expect(preConditions.factory).toBeCalledWith(preConditionDef)
        expect(transformers.factory).toBeCalledWith(transformDef)

        expect(transformerHandler).toHaveBeenCalledTimes(0)
        expect(preconditionsHandler).toBeCalledWith(entity, history, conn)
        expect(conn.query).toHaveBeenCalledTimes(0)

    })
    it('should reject if insertion fails', async () => {
        const error = new Error()
        const conn = {
            query: jest.fn().mockReturnValueOnce(Promise.reject(error))
        }
        const entity = { name: 'john smith' }
        const transformedObj = { fname: 'john', lname: 'smith' }
        const history = { preInsert: 'test' }
        const transformDef = {}
        const preConditionDef = {}
        const tableName = 'users'
        const label = 'InsertUser'

        preConditions.factory.mockReturnValueOnce(jest.fn().mockReturnValueOnce(Promise.resolve(true)))
        transformers.factory.mockReturnValueOnce(jest.fn().mockReturnValueOnce(Promise.resolve(transformedObj)))

        await expect(insertLoader({
            tableName,
            label,
            transform: transformDef,
            on: preConditionDef
        })(entity, history, conn)).rejects.toEqual(error)
    })
})