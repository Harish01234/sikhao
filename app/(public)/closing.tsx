import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Closing() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-12 text-center sm:py-16 md:py-20">
        <h2 className="font-heading text-3xl font-semibold md:text-4xl">
          Ready when you are.
        </h2>
        <p className="mt-3 max-w-md text-primary-foreground/80">
          Join Sikhao and learn, or teach.
        </p>
        <Link
          href="/sign-up"
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "mt-8 w-full max-w-xs sm:w-auto"
          )}
        >
          Sign up
        </Link>
      </div>
    </section>
  )
}
