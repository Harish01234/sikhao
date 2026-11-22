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
    <div className="flex w-full flex-col gap-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/instructor/courses/${courseId}/edit`}
          className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
        >
          Edit
        </Link>
        <Button
          type="button"
          variant="destructive"
          className="w-full sm:w-auto"
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
