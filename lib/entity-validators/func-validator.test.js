const funcValidator = require('./func-validator')
const common = require('../common')

jest.mock('../common', () => ({
    requireFile: jest.fn()
}));

describe('func-validator', () => {
    it('should return a function', () => {
        expect(typeof funcValidator.validator('')).toBe('function')
    })

    it('should validate obj using the validator function', () => {
        const func = jest.fn()
        common.requireFile.mockReturnValue(func)
        const expectedResult = Promise.resolve();
        func.mockReturnValueOnce(expectedResult)
        const obj = { 'prop': 1 }
        expect(funcValidator.validator(func)(obj)).toEqual(expectedResult)
        expect(func).toBeCalledWith(obj)
    })
})