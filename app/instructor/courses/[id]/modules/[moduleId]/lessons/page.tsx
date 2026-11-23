import { redirect } from "next/navigation";
import { GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOwnedCourse } from "../../../course-access";
import { prisma } from "@/src/lib/prisma";
import { cn } from "@/lib/utils";

import { CourseScreen } from "../../../course-screen";
import { LessonCardActions } from "./lesson-card-actions";
import { NewLessonButton } from "./new-lesson-button";

export const instant = false;

const pathCardClass =
  "rounded-2xl border border-border bg-card shadow-lg ring-0 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60";

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id, moduleId } = await params;
  const course = await requireOwnedCourse(id);
  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
  });

  if (!module) {
    redirect(`/instructor/courses/${course.id}/modules`);
  }

  const lessons = await prisma.lesson.findMany({
    where: { moduleId: module.id },
    orderBy: { position: "asc" },
    include: { video: true, scorm: true },
  });

  return (
    <CourseScreen back={{ href: `/instructor/courses/${course.id}/modules`, label: "Back" }}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{module.title}</h2>
            <p className="text-sm text-muted-foreground">
              {lessons.length === 0
                ? "Add the first lesson in this module."
                : `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`}
            </p>
          </div>
          <NewLessonButton courseId={course.id} moduleId={module.id} />
        </div>
        {lessons.length === 0 ? (
          <Card className={pathCardClass}>
            <CardHeader>
              <CardTitle>No lessons yet</CardTitle>
              <CardDescription>Add a video or a SCORM package to this module.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {lessons.map((lesson, index) => {
              const published = lesson.type === "video" ? Boolean(lesson.video) : Boolean(lesson.scorm);
              const minutes =
                lesson.video && lesson.video.length > 0
                  ? `${Math.max(1, Math.round(lesson.video.length / 60))} min`
                  : null;
              const detail =
                lesson.type === "video"
                  ? ["Video", minutes].filter(Boolean).join(" · ")
                  : "SCORM";

              return (
                <Card key={lesson.id} className={pathCardClass}>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <GripVertical aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-sm font-semibold text-[color-mix(in_oklab,var(--primary),white_60%)]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground">{detail}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge
                        className={cn(
                          "h-6 border-transparent px-2",
                          published
                            ? "bg-[oklch(from_var(--primary)_0.7_0.17_150)] text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {published ? "Published" : "Draft"}
                      </Badge>
                      <LessonCardActions
                        courseId={course.id}
                        moduleId={module.id}
                        lessonId={lesson.id}
                        title={lesson.title}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CourseScreen>
  );
}
