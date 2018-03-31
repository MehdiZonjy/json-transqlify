const createFactory = require('../../lib').createFactory;
require('../../lib').setLogLevel('verbose')
const db = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'json_transqlify_demos',
  connectionLimit: 2
}

const factory = createFactory(db)
const transqlifier = factory.createTransqlifier('./insert-users.yaml');

const obj =[
  { name: "Harry Potter", age: 10, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 10, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 10, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 10, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 10, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 10, address: { city: 'UK', country: 'Little Whinging' } }
] ;

transqlifier(obj).then(factory.closePool);

