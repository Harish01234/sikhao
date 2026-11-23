"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewCourseButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(buttonVariants(), "h-11 w-full bg-primary hover:bg-primary hover:brightness-125 sm:w-auto")}
      onClick={() => {
        router.push(`/instructor/courses/new?draft=${crypto.randomUUID()}`);
      }}
    >
      <Plus />
      New course
    </button>
  );
}
