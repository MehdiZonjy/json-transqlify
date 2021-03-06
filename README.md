# JSON TRANS SQLIFY 
This library aims to abstract away the following common functionalities involved when transforming and loading JSON into a MySQL database:

- Validation.
- Transformation.
- Insert and Update.

## Contents
- [How It Works](#howItWorks)
- [API](#api)
  - [Version](#version)
  - [Validator](#validator)
    - [Schema](#schemaValidator)
    - [Custom Function Validator](#funcValidator) 
  - [Transformers](#transformers)
    - [Columns Transformer](#columnsTransformer)
    - [Custom Function Transformer](#funcTransformer)
  - [Loaders](#loaders)
    - [Insert Loader](#insertLoader)
    - [Update Loader](#updateLoader)
    - [Upsert Loader](#upsertLoader)
    - [Batch Insert Loader](#batchInsertLoader)
    - [Batch Upsert Loader](#batchUpsertLoader)
  - [Preconditions](#preconditions)
    - [Expression Precondition](#expPrecondition)
    - [Db Precondition](#dbPrecondition)
    - [Custom Function Precondition](#funcPrecondition)
  - [$history](#$history)
  - [tableName](#$tableName)

## <a name="howItworks"></a>How It Works
```
npm install json-transqlify
```

You define how your entire TL (Transform Load) pipeline should look like with a `yaml` definition file.
Each definition file consists of two main sections:
 - Validator: which uses `json-schema` to validate the entity you are trying to TL.
 - Loaders: which does the actually Insert, Update to the specific tables

Assuming you have a bunch of user objects that you would like to insert to your database and each user contains the following fields:
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

The user Table schema is:
```sql
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

A Simple definition file that TL user objects might look like this:
```yaml
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

The `user-schema.json` uses `json-schema` rules to validate each user object to be inserted:
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

All that is left is to construct a JSON transqlifier object:
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
**Please refer to examples folder**

## <a name="api"></a>API
The definition file consists of the following sections:

### <a name="version"></a>Version
Should be 1.0 for now:
```yaml
version: 1.0
```

### <a name="validator"></a>Validator
The Validator filters out entities before they get handed to the Loaders. There are two kind of validators:

#### <a name="schemaValidator"></a>1. Schema
A schema validator can be defined using JSON files to describe how the entity schema should look like. Underneath the hood JSON Transqlifier uses [AJV](https://github.com/epoberezkin/ajv) implementation of [Json Schema](http://json-schema.org/)

The schema file for the entity should go under the `default` section (refer to the example below). While any `$ref` definitions can be used to load any additional definitions that the default schema might refer to.
For example, to write a validator for the following user object:
```json
{
  "name": "User Name",
  "age": 28,
  "address": {
    "country": "some country",
    "city": "some city"
  } 
}
```

We might break the validator into two schema definitions into User and Address:

1. `user-definition.json`:
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" },
    "address": {
      "$ref": "Address"
    }
  },
  "required": ["name", "age", "address"]
}
```

2. `address-definition.json`:
```json
{
  "type": "object",
  "properties": {
    "country": { "type": "string" },
    "city": { "type": "string" }
  },
  "required": ["country", "city"]
}
```

Then we can reference both schemas like this:
```yaml
version: 1.0
validator:
  schema:
    default: user-schema.json #a json file containing the JSON-SCHEMA definition for root entity
    refs:
      id: Address
      file: address-schema.json
```

#### <a name="funcValidator"></a>2. Custom Function Validator
When a `schema` validator is not enough you can have more control by providing a custom function validator.
The function should be defined in a separate file and exposed as a default export:
```javascript
// is-odd.js
const isOdd = num => num % 2
module.exports = isOdd
```

Then reference the custom validator in the Transqlifier definition file:
```yaml
version: 1.0
validator:
  func: is-odd.js
```

### <a name="transformers"></a>Transformers
Transformers are defined as part lof `loaders`. They map the given `$entity` to table columns.

#### <a name="columnsTransformer"></a>1. Columns Transformer
The columns transformer allows you to map `$entity` to table columns by defining custom expressions.

For example, given the `User` object mentioned earlier and `users` table with (fname, lname, age, country, city) columns:
```yaml
transformer:
  columns:
    - column: fname
      value: _.head($entity.name.split(' ')) # $entity refers to the object we are trying to transform. You can define here any expression you like and it will be evaluated at run time. You have access to Lodash by using (_)
    - column: lname
      value: _.tail($entity.name.split(' ')).join(' ')
    - column: age
      value: $entity.age
    - column: country
      value: $entity.address.country
    - column: city
      value: $entity.address.city
```

*$history:* if the transformer was part of multiple loaders pipeline, the `$history` can be used to access values transformed via a previous loader (more on this later)

#### <a name="funcTransformer"></a>2. Custom Function Transformer
A Custom function trasformer can be used by providing a file with a default exported function that returns a Promise:
```js
//custom-transformer.js
const func = ({$entity, $history, $conn}) => {
   // the transformer will be provided the following
   // $entity: the entity we are currently processing
   // $history: in case the transformer is part of multiple pipeline loaders, $history will containg previously transformer values
   // $conn a connection to the db
  return Promise.resolve({
    col1: 'val1',
    col2: 'val2'
  })
module.exports = func
}
```

```yaml
transformer:
  func: customer-transformer.js
```

### <a name="loaders"></a>Loaders
Loaders handle massaging the JSON (entity) and Inserting / Updating the DB.

The `loaders` section is an array, so you can insert the JSON into multiple tables by defining multiple loaders.

#### <a name="insertLoader"></a>1.Insert
The insert loaders inserts entity to a given table. It requires a `transformer` to be defined:
```yaml
loaders:
  - insert:
      tableName: users # table to insert entity into
      label: insertUser # a custom name to the loader.
      trasformer: # refer to transformers doc
        columns:
          - column: fname
            value: $entity.name 

```

#### <a name="updateLoader"></a>2. Update
The Update loader is used to update an existing row in database. It requires a `transformer` and update condition:
```yaml
loaders:
  - update:
      tableName: users
      transformer:
        columns:
          - column: fname
            value: $entity.name
      where:
        query: id = ?
        params:
          - $entity.id
```

#### <a name="upsertLoader"></a>3. Upsert
The Upsert loader is used to insert or update (on duplicate key error) existing record. It requires a `transformer`, `tableName`, and `label`:
```yaml
loaders:
  - upsert:
      tableName: courses
      primaryKey: id 
      transformer:
        columns:
          - column: title # when the title column has a unique index constraint, the existing record will get updated  
            value: $entity.title
          - column: difficulty
            value: $entity.difficulty
```

`primaryKey` is an optional field. It points to an auto incremented column (if any) in database. In case of update, it will be needed to retrieve the `id` of the affected row.
See `examples/upsert-example` for a working demo.

#### <a name="batchInsertLoader"></a>3. Batch Insert Loader
In case you want to bulk insert data in one go, Batch Insert Loader offers a great performance gain over multiple `Insert Loader`. It requires you to define `transformer`, `tableName`, `label` and `source`:
```yaml
  - batchInsert:
      tableName: users # table to insert entity into
      source: $entity
      label: insertUser # a custom name to the loader.
      trasformer: # refer to transformers doc
        columns:
          - column: fname
            value: $entity.name 
```

Source is an expression that should return an array of items that will be inserted. For example if `$entity` is:
```javascript
{
  items: ['item1', 'item1']
}
```

Then `source` should be defined as 
```yaml
source: $entity.source
```

In case $entity is the array of items you wish to insert, then define `source` as:
```yaml
source: $entity
```

#### <a name="batchUpsertLoader"></a>3. Batch Upsert Loader
In cases where you want to insert a bulk of data in one go. Batch Upsert Loader will insert and updated existing record in one transaction. It requires you to define `transformer`, `tableName`, `label` and `source`. 

```yaml
  - batchUpsert:
      source: $entity
      tableName: courses
      primaryKey: id 
      transformer:
        columns:
          - column: title # when the title column has a unique index constraint, the existing record will get updated  
            value: $entity.title
          - column: difficulty
            value: $entity.difficulty
```

### <a name="preconditions"></a>Preconditions
Preconditions validate `$enitity` before executing the loader, and if it returns false, the loader does not get executed.

#### <a name="expPrecondition"></a>1. Expression Precondition (exp)
Evalutes a given expression at runtime that can access `$entity` and `$history` objects. It can also use `_` lodash:
```yaml
loaders:
  - insert:
    transformer:
      columns:
        - column: name
          value: $entity.name
    on: # pre conditions are defined here 
      - exp: $entity.age < 30 # only insert uses who are below 30
```

#### <a name="dbPrecondition"></a>2. Database Query (db)
Runs a query against the database and allows you to assert the returned result.
Forexample, we want to insert a `course` but avoide duplicate titles
```json
{
  "title": "Course Title"
}
```

```yaml
loaders:
  - insert:
    transformer:
      tableName: courses
      columns:
        - column: title
          value: $entity.title
    on: # pre conditions are defined here 
      - db:
          query: SELECT 1 from courses WHERE title = ?
          params: 
            - $entity.title
          expect: $rows.length === 0 # $rows refers to the result of query 
```

#### <a name="funcPrecondition"></a>3: Custom Precondition function (func)
Executed a custom precondition function. The function is expected to return a promise that resolves to `true` or `false
```js
// custom-precondition.js
const func = ({$entity, $history, $conn}) => {
  // the precondition function will be provided the following
   // $entity: the entity we are currently processing
   // $history: in case the transformer is part of multiple pipeline loaders, $history will containg previously transformer values
   // $conn a connection to the db
  Promise.resolve(true)
}
module.exports = func
```
```yaml
loaders:
  - insert:
    transformer:
      tableName: courses
      columns:
        - column: title
          value: $entity.title
    on: # pre conditions are defined here 
      - func: custom-precondition.js
```

*Note:* preconditions are defined inside an array object. Meaning, you can provide multiple preconditions that should all resolve to `true` for the loader to execute.

### <a name="$history"></a>$history
The $history object can be accessed inside `transformers` and `preconditions`. It contains the result of previous loaders. For example:
```yaml
loaders:
  - insert:
      tableName: table1
      label: InsertTable1
      transformer:
        columns:
          - column: title
            value: $entity.title
  - insert:
      tableName: table2
      label: InsertTable2
      transformer:
        columns:
          - column: table1_id
            value: $history.InsertTable1.$insertedId # the tranformed value of each previous loader is added to $history inside <LABEL> of the loader. For Insert loaders the inserted Id for AutoIncreament columns is added to $insertedId.
          - column: cap_title
            value: $history.InsertTable.title.toUperCase() # $history has access to the transformed $entity fields 
```

*note:* In case there is a precondition defined in the First Loader, and that precondition happened to evalute to false, the loader result won't be added to `$history` object

### <a name="$tableName"></a>$tableName
The table name field defined in `loader` can either be a string referring to the table name or it can be an expression evaluated at runtime.
The expression has access to the following variables:

- `_`, `R` (ramda).
- `$entity`.
- `$source` (in case of batchInsert and batchUpsert loaders).

```yaml
loaders:
  - insert:
      tableName:
        exp: $entity.tableName
```
