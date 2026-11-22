import { CreateCourseForm } from "../create-course-form";

export const instant = false;

export default function NewCoursePage() {
  return (
    <div className="flex justify-center bg-background px-4 py-6 text-foreground">
      <div className="w-full max-w-md">
        <CreateCourseForm />
      </div>
    </div>
  );
}
