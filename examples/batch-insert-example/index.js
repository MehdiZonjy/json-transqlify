const createFactory = require('../../lib').createFactory;

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
  { name: "Harry Potter", age: 20, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 30, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 11, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 12, address: { city: 'UK', country: 'Little Whinging' } },
  { name: "Harry Potter", age: 13, address: { city: 'UK', country: 'Little Whinging' } }
] ;

transqlifier(obj).then(factory.closePool);

