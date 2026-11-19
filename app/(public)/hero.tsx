import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-14 text-center sm:py-20 md:py-28">
      <h1 className="max-w-3xl text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
        Anyone can learn. Anyone can teach.
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
        Sikhao is a place to take a course or make one. Start either way.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row">
        <Link
          href="/sign-up"
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          Start learning
        </Link>
        <Link
          href="/sign-up"
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "w-full sm:w-auto"
          )}
        >
          Start teaching
        </Link>
      </div>
    </section>
  )
}
