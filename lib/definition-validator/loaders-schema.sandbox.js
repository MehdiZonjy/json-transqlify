const Ajv = require('ajv')
const loaders = require('./loaders-schema')

const schemaV1_0 = {
  type: "object",
  properties: {
    loaders: { $ref: loaders.loadersId }
  },
  required: [
    "loaders"
  ]
}

const ajv = new Ajv()
loaders.register(ajv)
const validator = ajv.compile(schemaV1_0)

console.log(validator({
  loaders: [
    {
      update: {
        tableName: 'aa',
        label: 'xxx',
        transform: {
          columns: [
            {
              column: 'a',
              value:'zz'
            }
          ]
        },
        where: {
          query: '',
          
        }
      }
    }
  ]
}))

console.log(validator.errors)
