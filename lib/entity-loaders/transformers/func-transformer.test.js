const transformer = require('./func-transformer').transformer
const colDef = (column, value) => ({ column, value })
const common = require('../../common');

jest.mock('../../common', () => ({
    requireFile: jest.fn()
}))

describe('func-transformer', () => {
    it('should return a function', () => {
        expect(typeof transformer({})).toBe('function');
    })

    it('should use transformer function to transform entity', () => {
        const transformedEntity = {
            test: 1
        };
        const $entity = {
            prop: 'prop1'
        }
        const $conn = { query: jest.fn() }
        const $history = { test: 'test' }
        const funcDef = ''
        const func = jest.fn().mockReturnValueOnce(Promise.resolve(transformedEntity))
        common.requireFile.mockReturnValueOnce(func)
        expect(transformer(funcDef)({ $entity, $history, $conn })).resolves.toEqual(transformedEntity)
        expect(func).toHaveBeenCalledWith({ $entity, $history, $conn })
    })
})