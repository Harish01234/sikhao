"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteCourse } from "./actions";

export function CourseCardActions({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onDelete() {
    setError(null);
    setPending(true);

    const result = await deleteCourse(courseId);

    if (result && "error" in result && result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Link
          href={`/instructor/courses/${courseId}/edit`}
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
