import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Play } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

import { getMyCourse } from "../../dashboard/enrollments"

export const instant = false

export default async function LearnerCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getMyCourse(courseId)

  if (!course) {
    redirect("/learner/dashboard")
  }

  const lessonCount = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-5">
        <Link
          href="/learner/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 w-fit")}
        >
          <ArrowLeft />
          Back to my courses
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {course.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {course.instructorName}
            {" · "}
            {course.modules.length}{" "}
            {course.modules.length === 1 ? "module" : "modules"}
            {" · "}
            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </p>
          <p className="max-w-2xl pt-1 text-sm leading-6 text-muted-foreground">
            {course.description || "No description yet"}
          </p>
        </div>
      </div>
      {course.modules.length === 0 ? (
        <Card className="rounded-2xl border border-border bg-card shadow-md ring-0">
          <Empty className="border-0 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Play />
              </EmptyMedia>
              <EmptyTitle className="text-lg text-foreground">No modules yet</EmptyTitle>
              <EmptyDescription>This course has no lessons yet.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {course.modules.map((module, index) => (
            <Card
              key={module.id}
              className="gap-0 overflow-hidden rounded-2xl border border-border bg-card py-0 shadow-md ring-0"
            >
              <CardHeader className="border-b border-border py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Module {index + 1}
                    </p>
                    <CardTitle className="truncate text-lg font-semibold text-foreground">
                      {module.title}
                    </CardTitle>
                  </div>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {module.lessons.length}{" "}
                    {module.lessons.length === 1 ? "lesson" : "lessons"}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                {module.lessons.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-muted-foreground">No lessons yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <span className="w-5 shrink-0 text-sm text-muted-foreground">
                          {lessonIndex + 1}
                        </span>
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                          {lesson.title}
                        </p>
                        <Badge
                          variant="outline"
                          className="hidden h-5 shrink-0 border-border bg-muted px-2 text-xs text-muted-foreground sm:inline-flex"
                        >
                          {lesson.type === "video" ? "Video" : "SCORM"}
                        </Badge>
                        <Link
                          href={`/learner/courses/${course.id}/lessons/${lesson.id}`}
                          aria-label={`Play ${lesson.title}`}
                          className={cn(
                            buttonVariants({ size: "icon" }),
                            "size-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-none hover:bg-primary/90",
                          )}
                        >
                          <Play className="size-4 fill-current" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
