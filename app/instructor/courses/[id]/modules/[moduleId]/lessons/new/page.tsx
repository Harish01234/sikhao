import { redirect } from "next/navigation";

import { requireOwnedCourse } from "../../../../course-access";
import { prisma } from "@/src/lib/prisma";

import { CourseScreen } from "../../../../course-screen";
import { LessonForm } from "../lesson-form";

export const instant = false;

export default async function NewLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; moduleId: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { id, moduleId } = await params;
  const { draft } = await searchParams;
  const course = await requireOwnedCourse(id);
  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
  });

  if (!module) {
    redirect(`/instructor/courses/${course.id}/modules`);
  }

  return (
    <CourseScreen
      back={{
        href: `/instructor/courses/${course.id}/modules/${module.id}/lessons`,
        label: "Back",
      }}
    >
      <div className="mx-auto w-full max-w-xl">
        <LessonForm key={draft ?? "new"} courseId={course.id} moduleId={module.id} />
      </div>
    </CourseScreen>
  );
}
