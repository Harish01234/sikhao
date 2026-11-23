import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAuthSession } from "@/lib/auth-redirect";
import { prisma } from "@/src/lib/prisma";

import { CourseCardActions } from "./course-card-actions";
import { NewCourseButton } from "./new-course-button";

export const instant = false;

const pathCardClass =
  "rounded-2xl border border-border bg-card shadow-lg ring-0 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60";

function coursePriceLabel(price: { toString(): string }) {
  const amount = Number(price.toString());

  if (!Number.isFinite(amount) || amount === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export default async function InstructorCoursesPage() {
  const session = await getAuthSession();
  const courses = session
    ? await prisma.course.findMany({
        where: { instructorId: session.user.id },
        orderBy: { title: "asc" },
      })
    : [];

  return (
    <div className="bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Instructor
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-sm text-muted-foreground">
              {courses.length === 0
                ? "Courses you teach."
                : `${courses.length} ${courses.length === 1 ? "course" : "courses"}`}
            </p>
          </div>
          <NewCourseButton />
        </div>
        {courses.length === 0 ? (
          <Card className={pathCardClass}>
            <CardHeader>
              <CardTitle>No courses yet</CardTitle>
              <CardDescription>Create your first course to get started.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {courses.map((course, index) => {
              const free = Number(course.price) === 0;

              return (
                <Card key={course.id} className={pathCardClass}>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-sm font-semibold text-[color-mix(in_oklab,var(--primary),white_60%)]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold">{course.title}</h2>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {course.description?.trim() || "No description yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge
                        className={cn(
                          "h-6 border-transparent px-2",
                          free
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/15 text-[color-mix(in_oklab,var(--primary),white_60%)]",
                        )}
                      >
                        {coursePriceLabel(course.price)}
                      </Badge>
                      <CourseCardActions courseId={course.id} title={course.title} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
