"use client";

import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewModuleButton({ courseId }: { courseId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(buttonVariants(), "h-11 w-full bg-primary hover:bg-primary hover:brightness-125 sm:w-auto")}
      onClick={() => {
        router.push(`/instructor/courses/${courseId}/modules/new?draft=${crypto.randomUUID()}`);
      }}
    >
      New module
    </button>
  );
}
