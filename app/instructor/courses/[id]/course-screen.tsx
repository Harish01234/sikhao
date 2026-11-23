import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CourseScreen({
  children,
  back,
  next,
}: {
  children: React.ReactNode;
  back?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <div className="bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {children}
        {back || next ? (
          <div className="flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {back ? (
              <Link
                href={back.href}
                className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full sm:w-auto")}
              >
                <ArrowLeft />
                {back.label}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={next.href}
                className={cn(
                  buttonVariants(),
                  "h-12 w-full bg-primary hover:bg-primary hover:brightness-125 sm:w-auto",
                )}
              >
                {next.label}
                <ArrowRight />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
