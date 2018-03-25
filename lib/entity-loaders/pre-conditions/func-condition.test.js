const funcCondition = require('./func-condition')
const common = require('../../common')

jest.mock('../../common', () =>({
    requireFile: jest.fn()
}));

describe('func-condition', ()=>{
    it('should call custom function with $entity and conn and return value', async ()=>{
        const file = "customfile.js"
        const func = jest.fn()
        common.requireFile.mockReturnValueOnce(func)
        const $entity = {name: 'person'}
        const $history = {test: 'person2'}
        const conn = {}
        func.mockReturnValueOnce(Promise.resolve(true))
        await expect(funcCondition.condition(file)($entity, $history, conn)).resolves.toBeTruthy()
        expect(func).toBeCalledWith({$entity, $history, conn})
    })
})