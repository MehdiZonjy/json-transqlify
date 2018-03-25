const createFactory = require('../../lib').createFactory;

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

transqlifier(obj).then(factory.closePool);

