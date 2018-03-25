const createFactory = require('../../lib').createFactory;

const db = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'json_transqlify_demos',
  connectionLimit: 2
}

const factory = createFactory(db)
const transqlifier = factory.createTransqlifier('./insert-lesson.yaml');


const main = async () => {
  const lesson1 = { title: 'Lesson1 Title', course: { title: 'Course Title', level: 3 } }
  const lesson2 = { title: 'Lesson2 Title', course: { title: 'Course Title', level: 3 } }
  await transqlifier(lesson1)
  await transqlifier(lesson2)
  factory.closePool()
}

main()


