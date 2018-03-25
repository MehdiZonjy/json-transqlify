# JSON TRANS SQLIFY 
This library aims to abstract away some of the common functilnality involved when transforming and loading JSON into a Mysql database.
By common functionality I'm specifically referring to (Validate, Transform, Insert/Update)

## How does it work
You define how your entire TL(Transform Load) pipeline should look like by using a `yaml` definition file.
Each definition file consistes of 2 main secions.
 - Validator: which uses `json-schema` to validate the entity you are trying to TL.
 - Loaders: which does the actually Insert, Update to the specific tables

Assuming you have a bunch of user objects that you would like to insert to your db. Each user has the following fields
```json
{
  "name": "FIRST_NAME LAST_NAME",
  "age": "NUMBER",
  "address":{
    "country": "STRING",
    "city": "CITY"
  }
}
```
The user Table schema is
```sql
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fname` varchar(45) NOT NULL,
  `lname` varchar(45) NOT NULL,
  `age` int(11) NOT NULL,
  `country` varchar(45) NOT NULL,
  `city` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
)
```
A Simple definition file that TL(Transforms and Loads) user objects might look like this
```YAML
version: 1.0
validator:
  schema:  # validate user object schema  
    default: user-schema.json
loaders: # notice loaders is an array
  - insert:
      label: InsertUser # name of this operation (can be anything)
      tableName: users # table to which the json will be inserted
      transform: 
        columns: # map each column to appropreiate field on json
          - column: fname # insert into a column name fname
            value: $entity.name.split(' ')[0] # $entity refers to the user object we are inserting.
          - column: lname
            value: $entity.name.split(' ')[1] # grap last name
          - column: country
            value: $entity.address.country
          - column: city
            value: $entity.address.city
          - column: age
            value: $entity.age
            
``` 
The `user-schema.json` uses `json-schema` rules to validate each user object you are trying to insert.
``` json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "age": {
      "type": "number"
    },
    "address": {
      "type": "object",
      "properties": {
        "country": {
          "type": "string"
        },
        "city": {
          "type": "string"
        }
      },
      "required": [
        "country",
        "city"
      ]  
  },
  "required": [
    "name",
    "age"
  ]
}
```
All is left is to construct a json transqlifier object
```javascript
const createFactory = require('json-transqlify').createFactory;

const db = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'json_transqlify_demos',
  connectionLimit: 2
}

const factory = createFactory(db)
const transqlifier = factory.createTransqlifier('./insert-user.yaml');

const obj = { name: "Harry Potter", age: 10, address: { city: 'UK', country: 'Little Whinging' } };

transqlifier(obj);
```

## API
*will Add soon*