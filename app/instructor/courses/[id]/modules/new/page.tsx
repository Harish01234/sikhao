import { requireOwnedCourse } from "../../course-access";

import { CourseScreen } from "../../course-screen";
import { ModuleForm } from "../module-form";

export const instant = false;

export default async function NewModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { id } = await params;
  const { draft } = await searchParams;
  const course = await requireOwnedCourse(id);

  return (
    <CourseScreen back={{ href: `/instructor/courses/${course.id}/modules`, label: "Back" }}>
      <div className="mx-auto w-full max-w-xl">
        <ModuleForm key={draft ?? "new"} courseId={course.id} />
      </div>
    </CourseScreen>
  );
}
