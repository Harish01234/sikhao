import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-redirect";
import { prisma } from "@/src/lib/prisma";

export async function requireOwnedCourse(courseId: string) {
  const session = await getAuthSession();

  if (!session || session.user.role !== "instructor") {
    redirect("/instructor/courses");
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId: session.user.id },
  });

  if (!course) {
    redirect("/instructor/courses");
  }

  return course;
}
