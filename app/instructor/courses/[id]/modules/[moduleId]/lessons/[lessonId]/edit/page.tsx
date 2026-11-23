import { redirect } from "next/navigation";

import { requireOwnedCourse } from "../../../../../course-access";
import { prisma } from "@/src/lib/prisma";

import { LessonForm } from "../../lesson-form";

export const instant = false;

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>;
}) {
  const { id, moduleId, lessonId } = await params;
  const course = await requireOwnedCourse(id);
  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
  });

  if (!module) {
    redirect(`/instructor/courses/${course.id}/modules`);
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, moduleId: module.id },
    include: { video: true, scorm: true },
  });

  if (!lesson) {
    redirect(`/instructor/courses/${course.id}/modules/${module.id}/lessons`);
  }

  return (
    <div className="flex justify-center bg-background px-4 py-6 text-foreground">
      <div className="w-full max-w-md">
        <LessonForm
          courseId={course.id}
          moduleId={module.id}
          lesson={{
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            hasVideo: Boolean(lesson.video),
            hasScorm: Boolean(lesson.scorm),
          }}
        />
      </div>
    </div>
  );
}
