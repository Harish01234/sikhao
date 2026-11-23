import { redirect } from "next/navigation";

import { requireOwnedCourse } from "../../../course-access";
import { prisma } from "@/src/lib/prisma";

import { CourseScreen } from "../../../course-screen";
import { ModuleForm } from "../../module-form";

export const instant = false;

export default async function EditModulePage({
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

  return (
    <CourseScreen back={{ href: `/instructor/courses/${course.id}/modules`, label: "Back" }}>
      <div className="mx-auto w-full max-w-xl">
        <ModuleForm
          courseId={course.id}
          module={{
            id: module.id,
            title: module.title,
          }}
        />
      </div>
    </CourseScreen>
  );
}
