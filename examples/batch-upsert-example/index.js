const createFactory = require('../../lib').createFactory;

const db = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'json_transqlify_demos',
  connectionLimit: 2
}

const factory = createFactory(db)
const transqlifier = factory.createTransqlifier('./insert-course.yaml');


const main = async () => {
  const courses =[
     { title: 'Course1 Title', level: 3 },
     { title: 'Course2 Title', level: 3 },
     { title: 'Course3 Title', level: 2 },
     { title: 'Course4 Title', level: 5 },
  ]
  await transqlifier(courses)
  factory.closePool()
}

main()


