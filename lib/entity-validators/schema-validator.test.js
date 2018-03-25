const schemaValidator = require('./schema-validator')
const common = require('../common')

jest.mock('../common', () => ({
    requireFile: jest.fn()
}));

describe('schema-validator', () => {
    it('should validate objects aganist default schema', async () => {
        const defaultSchema = {
            "type": "object",
            "properties": {
                "name": { "type": "string" },
                "age": { "type": "number" }
            },
            "required": [
                "name",
                "age"
            ]
        }
        common.requireFile.mockReturnValueOnce(defaultSchema)

        const validator = schemaValidator.validator({
            'default': 'default-schema.json'
        })

        await expect(validator({ name: 'Mehdi', age: 26 })).resolves.toBeTruthy()
        await expect(validator({ name: 'Mehdi' })).rejects.toThrow()
    });

    it('should be able to add refrences to default schema', async () => {
        const defaultSchema = {
            "type": "object",
            "properties": {
                "name": { "type": "string" },
                "age": { "type": "number" },
                "address": { "$ref": "Address" }
            },
            "required": [
                "name",
                "age",
                "address"
            ]
        }
        const addressSchema = {
            "type": "object",
            "properties": {
                "city": { "type": "string" },
            },
            "required": [
                "city"
            ]          
        }
        common.requireFile.mockImplementation( file => {
            if(file === 'default-schema.json')
                return defaultSchema
            else if (file === 'address-schema.json')
            return addressSchema
        })

        const validator = schemaValidator.validator({
            'default': 'default-schema.json',
            "refs": [
                {
                    "id": "Address",
                    "file": "address-schema.json"
                }
            ]
        })

        await expect(validator({
            name: "Mehdi",
            age: 28,
            address: {
                city: "Somewhere"
            }
        }))

        await expect(validator({
            name: "Mehdi",
            age: 28
        })).rejects.toThrow()
    });
})