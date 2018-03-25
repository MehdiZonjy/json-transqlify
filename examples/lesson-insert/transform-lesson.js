const transformLesson = async ({ $entity, $history, $conn }) => {
  if ($history.InsertCourse) {
    return {
      title: $entity.title,
      course_id: $history.InsertCourse.$insertedId
    }
  }

  const result = await $conn.query('SELECT id from courses where title = ?', [$entity.course.title])
  return {
    title: $entity.title,
    course_id: result[0].id
  }
}

module.exports = transformLesson