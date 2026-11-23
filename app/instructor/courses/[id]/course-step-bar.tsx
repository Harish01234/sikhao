"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function CourseStepBar({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const pathname = usePathname();
  const moduleId = moduleIdFromPath(pathname);
  const place = pathname.includes("/lessons")
    ? "Lessons"
    : pathname.includes("/modules")
      ? "Modules"
      : "Course";

  const steps = [
    { label: "Course", href: `/instructor/courses/${courseId}/edit` },
    { label: "Modules", href: `/instructor/courses/${courseId}/modules` },
    ...(moduleId
      ? [
          {
            label: "Lessons",
            href: `/instructor/courses/${courseId}/modules/${moduleId}/lessons`,
          },
        ]
      : []),
  ];

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-4">
        <div>
          <h1 className="truncate text-base font-medium text-foreground">{courseTitle}</h1>
          <p className="text-sm text-muted-foreground">{place}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {steps.map((step, index) => (
            <span key={step.label} className="flex items-center gap-2">
              {index > 0 ? <span className="text-muted-foreground">/</span> : null}
              <Link
                href={step.href}
                className={cn(step.label === place ? "text-foreground" : "text-muted-foreground")}
              >
                {step.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}

function moduleIdFromPath(pathname: string) {
  const match = pathname.match(/\/modules\/([^/]+)/);
  const moduleId = match?.[1];

  if (!moduleId || moduleId === "new") {
    return null;
  }

  return moduleId;
}
