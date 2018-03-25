const factory = require('./precondition-factory').factory
const expCondition = require('./exp-condition')
const dbCondition = require('./db-condition')
const funcCondition = require('./func-condition')

jest.mock('./exp-condition', () => ({
    condition: jest.fn()
}))

jest.mock('./db-condition', () => ({
    condition: jest.fn()
}))

jest.mock('./func-condition', () => ({
    condition: jest.fn()
}))


describe('precondition-factory', () => {
    it('should be able to build exp-condition, db-condition and func-condition', async () => {
        const expHandler = jest.fn().mockReturnValueOnce(Promise.resolve(true))
        const dbHandler = jest.fn().mockReturnValueOnce(Promise.resolve(true))
        const funcHandler = jest.fn().mockReturnValueOnce(Promise.resolve(true))
        const exp = " 1  === 1"
        const db = { query: 'SELECT 1 FROM test' }
        const func = 'func1'
        
        const obj = { name: 'test' }
        const history = { prevInsert: 'test' }
        const conn = {}
        expCondition.condition.mockReturnValueOnce(expHandler)
        dbCondition.condition.mockReturnValueOnce(dbHandler)
        funcCondition.condition.mockReturnValueOnce(funcHandler)
        
        await expect(factory([
            { exp },
            { db },
            { func }
        ])(obj, history, conn)).resolves.toBeTruthy()

        expect(expCondition.condition).toHaveBeenCalledWith(exp)
        expect(dbCondition.condition).toHaveBeenCalledWith(db)
        expect(funcCondition.condition).toHaveBeenCalledWith(func)
        
        expect(expHandler).toHaveBeenCalledWith(obj, history, conn)
        expect(dbHandler).toHaveBeenCalledWith(obj, history, conn)
        expect(funcHandler).toHaveBeenCalledWith(obj, history, conn)
    })

    it('should be able to evalute multiple conditions and resolve to false if atleast on is false', async () => {
        const expHandler = jest.fn().mockReturnValueOnce(Promise.resolve(true))
        const dbHandler = jest.fn().mockReturnValueOnce(Promise.resolve(false))
        const funcHandler = jest.fn().mockReturnValueOnce(Promise.resolve(true))
        const exp = " 1  === 1"
        const db = { query: 'SELECT 1 FROM test' }
        const func = 'func1'
        
        const obj = { name: 'test' }
        const history = { prevInsert: 'test' }
        const conn = {}
        expCondition.condition.mockReturnValueOnce(expHandler)
        dbCondition.condition.mockReturnValueOnce(dbHandler)
        funcCondition.condition.mockReturnValueOnce(funcHandler)
        
        await expect(factory([
            { exp },
            { db },
            { func }
        ])(obj, history, conn)).resolves.toBeFalsy()
        
        expect(expHandler).toHaveBeenCalledWith(obj, history, conn)
        expect(dbHandler).toHaveBeenCalledWith(obj, history, conn)
        expect(funcHandler).toHaveBeenCalledWith(obj, history, conn)
    })

    it('should use a truthy condition when no definition is provided', async () => {
        const obj = { name: 'test' }
        const history = { prevInsert: 'test' }
        const conn = {}
        await expect(factory([])(obj, history, conn)).resolves.toBeTruthy()
        await expect(factory(undefined)(obj, history, conn)).resolves.toBeTruthy()
    })
})
