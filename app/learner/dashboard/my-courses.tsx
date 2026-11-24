import Link from "next/link"
import { ArrowRight, ImageIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

import type { EnrolledCourse } from "./enrollments"

const cardClass =
  "h-full gap-0 overflow-hidden rounded-2xl border border-border bg-card pt-0 shadow-md ring-0 transition-shadow duration-200 hover:shadow-lg"

function coursePriceLabel(price: number) {
  if (!Number.isFinite(price) || price === 0) {
    return "Free"
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price)
}

function nameInitial(name: string) {
  const letter = name.trim().charAt(0)
  return letter ? letter.toUpperCase() : "?"
}

export function MyCourses({ courses }: { courses: EnrolledCourse[] }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Learner
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            My courses
          </h1>
          <p className="text-sm text-muted-foreground">
            {courses.length === 1 ? "1 course" : `${courses.length} courses`}
          </p>
        </div>
      </div>
      {courses.length === 0 ? (
        <Card className={cardClass}>
          <Empty className="border-0 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImageIcon />
              </EmptyMedia>
              <EmptyTitle className="text-lg text-foreground">No courses yet</EmptyTitle>
              <EmptyDescription>You have not enrolled in a course.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                href="/course"
                className={cn(
                  buttonVariants(),
                  "h-11 bg-primary hover:bg-primary hover:brightness-125",
                )}
              >
                Browse courses
              </Link>
            </EmptyContent>
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className={cardClass}>
              <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-muted text-muted-foreground">
                <div className="absolute inset-0 bg-primary/10" />
                <div className="relative flex h-full flex-col items-center justify-center gap-2">
                  <ImageIcon className="size-8" aria-hidden="true" />
                  <span className="text-xs">Placeholder</span>
                </div>
                <Badge className="absolute top-3 right-3 border border-border bg-background/70 text-foreground shadow-none backdrop-blur-md">
                  {coursePriceLabel(course.price)}
                </Badge>
              </div>
              <CardHeader className="gap-2 pt-4 pb-0">
                <Badge
                  variant="outline"
                  className="h-5 border-border bg-muted px-2 text-xs font-medium text-muted-foreground"
                >
                  Active
                </Badge>
                <CardTitle className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-2 pb-4">
                <CardDescription className="line-clamp-3 min-h-10 leading-6">
                  {course.description || "No description yet"}
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary/15 text-xs text-primary">
                      {nameInitial(course.instructorName)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="truncate text-sm text-foreground">{course.instructorName}</p>
                </div>
              </CardContent>
              <CardFooter className="mt-auto border-border bg-card">
                <Link
                  href={`/learner/courses/${course.id}`}
                  className={cn(
                    buttonVariants(),
                    "h-11 w-full rounded-lg bg-primary text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90",
                  )}
                >
                  Start course
                  <ArrowRight />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
