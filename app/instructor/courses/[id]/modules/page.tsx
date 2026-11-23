import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOwnedCourse } from "../course-access";
import { prisma } from "@/src/lib/prisma";

import { ModuleCardActions } from "./module-card-actions";
import { NewModuleButton } from "./new-module-button";

export const instant = false;

export default async function ModulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await requireOwnedCourse(id);
  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { position: "asc" },
  });

  return (
    <div className="bg-background px-4 py-6 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-medium tracking-tight">Modules</h2>
            <p className="text-sm text-muted-foreground">
              {modules.length === 0
                ? "Sections of this course."
                : `${modules.length} ${modules.length === 1 ? "module" : "modules"}`}
            </p>
          </div>
          <NewModuleButton courseId={course.id} />
        </div>
        {modules.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No modules yet</CardTitle>
              <CardDescription>Add the first section of this course.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {modules.map((module) => (
              <Card key={module.id} size="sm">
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="min-w-0 truncate text-base font-medium">{module.title}</h3>
                  <ModuleCardActions courseId={course.id} moduleId={module.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
