import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { getMyLesson } from "./lesson"
import { VideoPlayer } from "./video-player"

export const instant = false

export default async function LearnerLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const lesson = await getMyLesson(courseId, lessonId)

  if (!lesson) {
    redirect(`/learner/courses/${courseId}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Link
        href={`/learner/courses/${courseId}`}
        className={cn(buttonVariants({ variant: "outline" }), "h-11 w-fit")}
      >
        <ArrowLeft />
        Back to course
      </Link>
      <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
        {lesson.title}
      </h1>
      {lesson.type === "scorm" ? (
        <Card className="rounded-2xl border border-border bg-card shadow-md ring-0">
          <CardHeader>
            <CardTitle>SCORM</CardTitle>
            <CardDescription>The SCORM player is not ready yet.</CardDescription>
          </CardHeader>
        </Card>
      ) : lesson.playbackUrl ? (
        <VideoPlayer url={lesson.playbackUrl} title={lesson.title} />
      ) : (
        <Card className="rounded-2xl border border-border bg-card shadow-md ring-0">
          <CardHeader>
            <CardTitle>Video</CardTitle>
            <CardDescription>This video is not ready yet.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
