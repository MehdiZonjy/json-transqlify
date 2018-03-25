const columnsTransformer = require('./columns-transformer');
const funcTransformer = require('./func-transformer');
const transformersFactory = require('./transformers-factory').factory
jest.mock('./columns-transformer', ()=> ({
    transformer: jest.fn()
}));
jest.mock('./func-transformer', ()=> ({
    transformer: jest.fn()
}));

describe('transformers-factory', ()=>{
    it('should return columns transformer when transformer definition has a columns prop', ()=>{
        const func = jest.fn()
        const columnsDef = {'column': 1}
        columnsTransformer.transformer.mockReturnValueOnce(func)
        const transformerDef = {
            columns: columnsDef
        }
        expect(transformersFactory(transformerDef)).toEqual(func)
    });

    it('should return func transormer when transformer definition has a func prop', ()=>{
        const func = jest.fn()
        const funcDef = 'func'
        funcTransformer.transformer.mockReturnValueOnce(func)
        const transformerDef = {
            func: funcDef
        }
        expect(transformersFactory({func: funcDef})).toEqual(func)
    });
});