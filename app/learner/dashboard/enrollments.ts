import { getAuthSession } from "@/lib/auth-redirect"
import { prisma } from "@/src/lib/prisma"

export type EnrolledCourse = {
  id: string
  title: string
  description: string
  instructorName: string
  price: number
}

export type CourseLesson = {
  id: string
  title: string
  type: "video" | "scorm"
}

export type CourseModule = {
  id: string
  title: string
  lessons: CourseLesson[]
}

export type MyCourse = EnrolledCourse & {
  modules: CourseModule[]
}

export async function listMyCourses(): Promise<EnrolledCourse[]> {
  const session = await getAuthSession()

  if (session?.user.role !== "learner") {
    return []
  }

  const rows = await prisma.courseEnrollment.findMany({
    where: {
      learnerId: session.user.id,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
    select: {
      price: true,
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          instructor: { select: { name: true } },
        },
      },
    },
  })

  return rows.map((row) => ({
    id: row.course.id,
    title: row.course.title,
    description: row.course.description ?? "",
    instructorName: row.course.instructor.name,
    price: Number(row.price),
  }))
}

export async function getMyCourse(courseId: string): Promise<MyCourse | null> {
  const session = await getAuthSession()

  if (session?.user.role !== "learner" || !courseId) {
    return null
  }

  const row = await prisma.courseEnrollment.findUnique({
    where: {
      learnerId_courseId: {
        learnerId: session.user.id,
        courseId,
      },
    },
    select: {
      status: true,
      price: true,
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          instructor: { select: { name: true } },
          modules: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              lessons: {
                orderBy: { position: "asc" },
                select: {
                  id: true,
                  title: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!row || row.status !== "active") {
    return null
  }

  return {
    id: row.course.id,
    title: row.course.title,
    description: row.course.description ?? "",
    instructorName: row.course.instructor.name,
    price: Number(row.price),
    modules: row.course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
      })),
    })),
  }
}
