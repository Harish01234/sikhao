"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const doneColor = "bg-[oklch(from_var(--primary)_0.7_0.17_150)]";

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
    {
      label: "Lessons",
      href: moduleId
        ? `/instructor/courses/${courseId}/modules/${moduleId}/lessons`
        : undefined,
    },
  ];
  const currentIndex = Math.max(
    steps.findIndex((step) => step.label === place),
    0,
  );

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Creating course
          </p>
          <h1 className="text-3xl font-bold text-balance text-foreground">{courseTitle}</h1>
        </div>
        <nav aria-label="Course steps">
          <ol className="grid grid-cols-3">
            {steps.map((step, index) => {
              const state =
                index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";

              return (
                <li key={step.label} className="relative flex min-w-0 flex-col items-center">
                  {index < steps.length - 1 ? (
                    <Separator
                      className={cn(
                        "absolute top-5.5 left-1/2 z-0 w-full -translate-y-1/2",
                        index < currentIndex
                          ? doneColor
                          : "border-t border-dotted border-border bg-transparent",
                      )}
                    />
                  ) : null}
                  <StepLink href={step.href} current={state === "current"}>
                    <span
                      className={cn(
                        "relative z-10 flex size-11 items-center justify-center rounded-full text-sm font-medium transition-all duration-150",
                        state === "complete" && cn(doneColor, "text-primary-foreground"),
                        state === "current" &&
                          "bg-primary text-primary-foreground brightness-125 shadow-[0_0_24px_color-mix(in_oklab,var(--primary),white_20%)] ring-4 ring-primary/30",
                        state === "upcoming" && "border border-border bg-card text-muted-foreground",
                      )}
                    >
                      {state === "complete" ? <Check className="size-4" /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        "max-w-full truncate text-center text-sm transition-colors duration-150",
                        state === "current" ? "font-bold text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </StepLink>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}

function StepLink({
  href,
  current,
  children,
}: {
  href?: string;
  current: boolean;
  children: React.ReactNode;
}) {
  const className =
    "relative z-10 flex w-full min-w-0 flex-col items-center gap-2 rounded-lg focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none";

  if (!href) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Link href={href} aria-current={current ? "step" : undefined} className={className}>
      {children}
    </Link>
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
