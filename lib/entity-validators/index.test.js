const validatorFactory = require('./index');
const schemaValidator = require('./schema-validator')
const funcValidator = require('./func-validator')

jest.mock('./schema-validator', () =>({
    validator: jest.fn()
}))
jest.mock('./func-validator', ()=> ({
    validator: jest.fn()
}));


describe('object-validator-factory', ()=>{
    it('should return a truthy validator if no definition is provided', async ()=>{
        await expect(validatorFactory({})()).resolves.toBeTruthy()
    });

    it('should return func validator when a func definition is provided', async ()=>{
        const func = jest.fn()
        funcValidator.validator.mockReturnValue(func)
        func.mockReturnValueOnce(Promise.resolve(true))
        const obj = {prop: 'val'}
        await expect(validatorFactory({func: ''})(obj)).resolves.toBeTruthy();
        expect(func).toBeCalledWith(obj)
    });

    it('should return a schema validator when schema definition is provided', async ()=>{
        const func = jest.fn()
        schemaValidator.validator.mockReturnValue(func)
        func.mockReturnValueOnce(Promise.resolve(true))
        const obj = {prop: 'val'}
        await expect(validatorFactory({schema: ''})(obj)).resolves.toBeTruthy();
        expect(func).toBeCalledWith(obj)     
    })
})