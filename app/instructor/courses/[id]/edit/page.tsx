import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-redirect";
import { prisma } from "@/src/lib/prisma";

import { CreateCourseForm } from "../../create-course-form";
import { CourseScreen } from "../course-screen";

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
    <CourseScreen
      back={{ href: "/instructor/courses", label: "Back" }}
      next={{ href: `/instructor/courses/${course.id}/modules`, label: "Next: Modules" }}
    >
      <div className="mx-auto w-full max-w-xl">
        <CreateCourseForm
          course={{
            id: course.id,
            title: course.title,
            description: course.description ?? "",
            price: Number(course.price),
          }}
        />
      </div>
    </CourseScreen>
  );
}
