import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseCardActions } from "./course-card-actions";
import { getAuthSession } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";
import { prisma } from "@/src/lib/prisma";

export const instant = false;

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
    <div className="bg-background px-4 py-6 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-medium tracking-tight">Courses</h1>
            <p className="text-sm text-muted-foreground">
              {courses.length === 0
                ? "Courses you teach."
                : `${courses.length} ${courses.length === 1 ? "course" : "courses"}`}
            </p>
          </div>
          <Link href="/instructor/courses/new" className={cn(buttonVariants(), "w-full sm:w-auto")}>
            New course
          </Link>
        </div>
        {courses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No courses yet</CardTitle>
              <CardDescription>Create your first course to get started.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => (
              <Card key={course.id} size="sm">
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-medium">{course.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {course.description?.trim() || "No description yet"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                    <Badge variant={Number(course.price) === 0 ? "secondary" : "outline"}>
                      {coursePriceLabel(course.price)}
                    </Badge>
                    <CourseCardActions courseId={course.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
