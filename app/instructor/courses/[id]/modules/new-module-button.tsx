"use client";

import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewModuleButton({ courseId }: { courseId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(buttonVariants(), "w-full sm:w-auto")}
      onClick={() => {
        router.push(`/instructor/courses/${courseId}/modules/new?draft=${crypto.randomUUID()}`);
      }}
    >
      New module
    </button>
  );
}
