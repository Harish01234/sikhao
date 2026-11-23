"use client";

import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewLessonButton({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(buttonVariants(), "w-full sm:w-auto")}
      onClick={() => {
        router.push(
          `/instructor/courses/${courseId}/modules/${moduleId}/lessons/new?draft=${crypto.randomUUID()}`,
        );
      }}
    >
      New lesson
    </button>
  );
}
