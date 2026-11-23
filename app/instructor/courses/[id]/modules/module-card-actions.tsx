"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { deleteModule } from "./actions";

export function ModuleCardActions({
  courseId,
  moduleId,
  title,
}: {
  courseId: string;
  moduleId: string;
  title: string;
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
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons`}
          className={cn(
            buttonVariants(),
            "h-11 bg-primary hover:bg-primary hover:brightness-125",
          )}
        >
          Lessons
          <ArrowRight />
        </Link>
        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}/edit`}
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
