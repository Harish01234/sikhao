import { listMyCourses } from "./enrollments"
import { MyCourses } from "./my-courses"

export const instant = false

export default async function LearnerDashboardPage() {
  const courses = await listMyCourses()

  return <MyCourses courses={courses} />
}
