import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseCardActions } from "./course-card-actions";
import { getAuthSession } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";
import { prisma } from "@/src/lib/prisma";

export const instant = false;

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-medium">Courses</h1>
            <p className="text-sm text-muted-foreground">Courses you teach.</p>
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
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.price.toString()}</CardDescription>
                </CardHeader>
                {course.description ? (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </CardContent>
                ) : null}
                <CardFooter className="border-t-0 bg-transparent">
                  <CourseCardActions courseId={course.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
