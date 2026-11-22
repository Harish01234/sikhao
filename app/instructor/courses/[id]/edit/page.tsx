import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-redirect";
import { prisma } from "@/src/lib/prisma";

import { CreateCourseForm } from "../../create-course-form";

export const instant = false;

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAuthSession();

  if (!session || session.user.role !== "instructor") {
    redirect("/instructor/courses");
  }

  const course = await prisma.course.findFirst({
    where: { id, instructorId: session.user.id },
  });

  if (!course) {
    redirect("/instructor/courses");
  }

  return (
    <div className="flex justify-center bg-background px-4 py-6 text-foreground">
      <div className="w-full max-w-md">
        <CreateCourseForm
          course={{
            id: course.id,
            title: course.title,
            description: course.description ?? "",
            price: Number(course.price),
          }}
        />
      </div>
    </div>
  );
}
