import { getAuthSession } from "@/lib/auth-redirect"
import { createPlaybackUrl } from "@/lib/storage"
import { prisma } from "@/src/lib/prisma"

export type MyVideoLesson = {
  title: string
  type: "video"
  playbackUrl: string | null
}

export type MyScormLesson = {
  title: string
  type: "scorm"
}

export async function getMyLesson(
  courseId: string,
  lessonId: string,
): Promise<MyVideoLesson | MyScormLesson | null> {
  const session = await getAuthSession()

  if (session?.user.role !== "learner" || !courseId || !lessonId) {
    return null
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      learnerId_courseId: {
        learnerId: session.user.id,
        courseId,
      },
    },
    select: { status: true },
  })

  if (!enrollment || enrollment.status !== "active") {
    return null
  }

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      module: { courseId },
    },
    select: {
      title: true,
      type: true,
      video: { select: { videoUrl: true } },
    },
  })

  if (!lesson) {
    return null
  }

  if (lesson.type === "scorm") {
    return { title: lesson.title, type: "scorm" }
  }

  if (!lesson.video) {
    return { title: lesson.title, type: "video", playbackUrl: null }
  }

  const playbackUrl = await createPlaybackUrl(lesson.video.videoUrl)

  return { title: lesson.title, type: "video", playbackUrl }
}
