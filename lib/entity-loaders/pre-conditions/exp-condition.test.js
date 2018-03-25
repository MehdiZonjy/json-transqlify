const expCondition = require('./exp-condition')

describe('exp-condition', () => {
    it('should evalute expression and return result', async () => {
        await expect(expCondition.condition('1 === 1')({})).resolves.toBeTruthy()
    });

    it('should be able to reference $entity', async () => {
        await expect(expCondition.condition('$entity.name === "test"')({ name: "test" })).resolves.toBeTruthy()
    })

    it('should be able to reference lodash', async () => {
        await expect(expCondition.condition('_.first($entity.items) === 3')({ items: [3, 4] })).resolves.toBeTruthy()
    })
    it('should be able to reference $history', async () => {
        await expect(expCondition.condition('$history.items.length > 0')({}, { items: [3, 4] })).resolves.toBeTruthy()

    })
})