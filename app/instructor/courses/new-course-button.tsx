"use client";

import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewCourseButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(buttonVariants(), "w-full sm:w-auto")}
      onClick={() => {
        router.push(`/instructor/courses/new?draft=${crypto.randomUUID()}`);
      }}
    >
      New course
    </button>
  );
}
