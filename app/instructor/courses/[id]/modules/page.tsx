import { GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOwnedCourse } from "../course-access";
import { prisma } from "@/src/lib/prisma";
import { cn } from "@/lib/utils";

import { CourseScreen } from "../course-screen";
import { ModuleCardActions } from "./module-card-actions";
import { NewModuleButton } from "./new-module-button";

export const instant = false;

const pathCardClass =
  "rounded-2xl border border-border bg-card shadow-lg ring-0 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60";

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
    include: {
      lessons: {
        select: {
          type: true,
          video: { select: { lessonId: true } },
          scorm: { select: { lessonId: true } },
        },
      },
    },
  });
  const firstModule = modules[0];

  return (
    <CourseScreen
      back={{ href: `/instructor/courses/${course.id}/edit`, label: "Back" }}
      next={
        firstModule
          ? {
              href: `/instructor/courses/${course.id}/modules/${firstModule.id}/lessons`,
              label: "Next: Lessons",
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
            <p className="text-sm text-muted-foreground">
              {modules.length === 0
                ? "Add the first section of this course."
                : `${modules.length} ${modules.length === 1 ? "module" : "modules"}`}
            </p>
          </div>
          <NewModuleButton courseId={course.id} />
        </div>
        {modules.length === 0 ? (
          <Card className={pathCardClass}>
            <CardHeader>
              <CardTitle>No modules yet</CardTitle>
              <CardDescription>Add the first section of this course.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {modules.map((module, index) => {
              const count = module.lessons.length;
              const published =
                count > 0 &&
                module.lessons.every((lesson) => (lesson.type === "video" ? lesson.video : lesson.scorm));

              return (
                <Card key={module.id} className={pathCardClass}>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <GripVertical aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-sm font-semibold text-[color-mix(in_oklab,var(--primary),white_60%)]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">{module.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {count} {count === 1 ? "lesson" : "lessons"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <StatusBadge published={published} />
                      <ModuleCardActions
                        courseId={course.id}
                        moduleId={module.id}
                        title={module.title}
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

function StatusBadge({ published }: { published: boolean }) {
  return (
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
  );
}
