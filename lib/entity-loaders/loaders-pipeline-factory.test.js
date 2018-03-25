const loadersPipelineFactory = require('./loaders-pipeline-factory')
const loaders = require('./loaders')
jest.mock('./loaders', () => ({
    factory: jest.fn()
}))

describe('loaders-pipeline-factory', () => {
    it('should create loaders and apply each one to object', async () => {
        const loader1 = jest.fn().mockReturnValue(Promise.resolve({ loader1: true }))
        const loader2 = jest.fn((o, h) => Promise.resolve({ ...h, loader2: true }))
        const conn = {
            beginTransaction: jest.fn().mockReturnValue(Promise.resolve()),
            commit: jest.fn().mockReturnValueOnce(Promise.resolve()),
            rollback: jest.fn().mockReturnValueOnce(Promise.resolve())
        }
        loaders.factory.mockReturnValueOnce(loader1)
        loaders.factory.mockReturnValueOnce(loader2)

        const obj = { name: 'test' }

        await expect(loadersPipelineFactory([
            1, 2
        ])(obj, conn)).resolves.toEqual({ loader1: true, loader2: true })
        expect(conn.beginTransaction).toHaveBeenCalledTimes(1)
        expect(loader1).toHaveBeenCalledTimes(1)
        expect(loader1).toHaveBeenCalledWith(obj, {}, conn)
        expect(loader2).toHaveBeenCalledWith(obj, { loader1: true }, conn)
        expect(conn.commit).toHaveBeenCalledTimes(1)
    })
    it('should rollback on error and reject', async () => {
        const error = new Error()
        const loader1 = jest.fn().mockReturnValue(Promise.reject(error))
        const conn = {
            beginTransaction: jest.fn().mockReturnValue(Promise.resolve()),
            commit: jest.fn().mockReturnValueOnce(Promise.resolve()),
            rollback: jest.fn().mockReturnValueOnce(Promise.resolve())
        }
        loaders.factory.mockReturnValueOnce(loader1)

        const obj = { name: 'test' }

        await expect(loadersPipelineFactory([
            1
        ])(obj, conn)).rejects.toEqual(error)
        expect(conn.rollback).toHaveBeenCalledTimes(1)
    })
})