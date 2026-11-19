import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const paths = [
  {
    title: "Learn",
    text: "Take a course at your own pace.",
    action: "Start learning",
  },
  {
    title: "Teach",
    text: "Share what you know and make a course.",
    action: "Start teaching",
  },
]

export function Paths() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16 md:py-20">
      <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
        Two ways in
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {paths.map((path) => (
          <Card key={path.title}>
            <CardHeader>
              <CardTitle className="text-xl">{path.title}</CardTitle>
              <CardDescription>{path.text}</CardDescription>
            </CardHeader>
            <CardContent />
            <CardFooter>
              <Link
                href="/sign-up"
                className={cn(buttonVariants(), "w-full sm:w-auto")}
              >
                {path.action}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
