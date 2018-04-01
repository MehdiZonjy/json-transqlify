const dbCondition = require('./db-condition')

describe('db-condition', () => {
    it('should execute a query and return true if query returns any results', async () => {
        const $conn = {
            query: jest.fn()
        }
        const queryResult = { length: 1 }
        const query = 'select * from somewhere'
        const params = ['$entity.name', '2', '_.first($entity.items)']
        const $entity = { name: 'test', items: [3] }

        $conn.query.mockReturnValueOnce(queryResult)
        await expect(dbCondition.condition({
            query,
            params,
            expect: '$rows.length === 1'
        })({ $entity, $conn })).resolves.toBeTruthy()
        expect($conn.query).toHaveBeenCalledWith(query, [$entity.name, 2, 3])
    })

    it('should be able to reference $history', async () => {
        const $conn = {
            query: jest.fn()
        }
        const queryResult = { length: 1 }
        const query = 'select * from somewhere'
        const params = ['$history.insertUser.name', '2']
        const $history = { insertUser: { name: 'test' } }

        $conn.query.mockReturnValueOnce(queryResult)
        await expect(dbCondition.condition({
            query,
            params,
            expect: '$rows.length === 1'
        })({ $history, $conn })).resolves.toBeTruthy()
    })
})