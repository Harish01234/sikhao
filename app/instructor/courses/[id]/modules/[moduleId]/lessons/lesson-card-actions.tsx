"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { deleteLesson } from "./actions";

export function LessonCardActions({
  courseId,
  moduleId,
  lessonId,
  title,
}: {
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onDelete() {
    setError(null);
    setPending(true);

    const result = await deleteLesson(courseId, moduleId, lessonId);

    if (result && "error" in result && result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`}
          aria-label={`Edit ${title}`}
          className={cn(buttonVariants({ variant: "outline" }), "size-11")}
        >
          <Pencil />
        </Link>
        <Button
          type="button"
          variant="outline"
          aria-label={`Delete ${title}`}
          disabled={pending}
          onClick={onDelete}
          className="size-11 text-foreground transition-colors duration-150 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
