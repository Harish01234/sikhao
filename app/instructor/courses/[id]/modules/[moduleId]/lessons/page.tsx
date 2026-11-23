import { redirect } from "next/navigation";

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

import { LessonCardActions } from "./lesson-card-actions";
import { NewLessonButton } from "./new-lesson-button";

export const instant = false;

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
    <div className="bg-background px-4 py-6 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-medium tracking-tight">{module.title}</h2>
            <p className="text-sm text-muted-foreground">
              {lessons.length === 0
                ? "Lessons in this module."
                : `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`}
            </p>
          </div>
          <NewLessonButton courseId={course.id} moduleId={module.id} />
        </div>
        {lessons.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No lessons yet</CardTitle>
              <CardDescription>Add the first lesson in this module.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {lessons.map((lesson) => (
              <Card key={lesson.id} size="sm">
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <h3 className="truncate text-base font-medium">{lesson.title}</h3>
                    <Badge variant="secondary">{lesson.type === "video" ? "Video" : "SCORM"}</Badge>
                    {(lesson.type === "video" ? !lesson.video : !lesson.scorm) ? (
                      <span className="text-sm text-muted-foreground">No file yet</span>
                    ) : null}
                  </div>
                  <LessonCardActions
                    courseId={course.id}
                    moduleId={module.id}
                    lessonId={lesson.id}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
