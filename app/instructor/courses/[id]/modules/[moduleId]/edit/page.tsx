import { redirect } from "next/navigation";

import { requireOwnedCourse } from "../../../course-access";
import { prisma } from "@/src/lib/prisma";

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
    <div className="flex justify-center bg-background px-4 py-6 text-foreground">
      <div className="w-full max-w-md">
        <ModuleForm
          courseId={course.id}
          module={{
            id: module.id,
            title: module.title,
          }}
        />
      </div>
    </div>
  );
}
