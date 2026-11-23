import { requireOwnedCourse } from "../../course-access";

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
    <div className="flex justify-center bg-background px-4 py-6 text-foreground">
      <div className="w-full max-w-md">
        <ModuleForm key={draft ?? "new"} courseId={course.id} />
      </div>
    </div>
  );
}
