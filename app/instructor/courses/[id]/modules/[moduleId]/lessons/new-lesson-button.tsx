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
      className={cn(buttonVariants(), "h-11 w-full bg-primary hover:bg-primary hover:brightness-125 sm:w-auto")}
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
