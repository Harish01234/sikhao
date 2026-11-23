"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { deleteModule } from "./actions";

export function ModuleCardActions({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onDelete() {
    setError(null);
    setPending(true);

    const result = await deleteModule(courseId, moduleId);

    if (result && "error" in result && result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Lessons
        </Link>
        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}/edit`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Edit
        </Link>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? "Deleting..." : "Delete"}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
