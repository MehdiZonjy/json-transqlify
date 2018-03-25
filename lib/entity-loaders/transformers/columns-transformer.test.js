const transformer = require('./columns-transformer').transformer
const colDef = (column, value) => ({column, value})

describe('columns-transformer', ()=>{
    it('should return a function', ()=>{
        expect(typeof transformer({})).toBe('function')
    });

    it('should transform entity based on columns definition', ()=>{
        const columnsDef = [
            colDef('col1', '$entity.prop1'),
            colDef('col2', '$entity.prop2')
        ]
        const entity = {
            prop1: 'test1',
            prop2: 'test2'
        }
        expect(transformer(columnsDef)(entity)).resolves.toEqual({
            col1: 'test1',
            col2: 'test2'
        })
    });

    it('should be able to evalute expressions', ()=>{
        const columnsDef = [
            colDef('col1', '$entity.value + 5')
        ]
        const entity = {
            value: 1
        }
        expect(transformer(columnsDef)(entity)).resolves.toEqual({
            col1: 6
        })
    });

    it('should be able to use lodash to evalute expressions', ()=>{
        const columnsDef = [
            colDef('col1', '_.first($entity)')
        ]
        const entity = [1,2,3]
        expect(transformer(columnsDef)(entity)).resolves.toEqual({
            col1: 1
        })
    });
})