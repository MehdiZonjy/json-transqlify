const expCondition = require('./exp-condition')

describe('exp-condition', () => {
    it('should evalute expression and return result', async () => {
        await expect(expCondition.condition('1 === 1')({})).resolves.toBeTruthy()
    });

    it('should be able to reference $entity', async () => {
        const $entity = { name: 'test' }
        await expect(expCondition.condition('$entity.name === "test"')({ $entity })).resolves.toBeTruthy()
    })

    it('should be able to reference lodash', async () => {
        const $entity = { items: [3, 4] }
        await expect(expCondition.condition('_.first($entity.items) === 3')({ $entity })).resolves.toBeTruthy()
    })
    it('should be able to reference $history', async () => {
        const $history = { items: [3, 4] }
        await expect(expCondition.condition('$history.items.length > 0')({ $history })).resolves.toBeTruthy()

    })
})