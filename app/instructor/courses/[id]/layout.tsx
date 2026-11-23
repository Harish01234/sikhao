import { requireOwnedCourse } from "./course-access";
import { CourseStepBar } from "./course-step-bar";

export const instant = false;

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await requireOwnedCourse(id);

  return (
    <div className="bg-background text-foreground">
      <CourseStepBar courseId={course.id} courseTitle={course.title} />
      {children}
    </div>
  );
}
