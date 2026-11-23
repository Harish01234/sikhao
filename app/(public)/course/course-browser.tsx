"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, SearchIcon } from "lucide-react"

import { enrollInCourse, listCourses } from "@/app/(public)/course/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CourseListItem } from "@/zodschemas/course-list-schema"

const priceItems = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
]

type PriceFilter = "all" | "free" | "paid"

function coursePriceLabel(price: number) {
  if (!Number.isFinite(price) || price === 0) {
    return "Free"
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price)
}

export function CourseBrowser({
  initialCourses,
  initialError,
}: {
  initialCourses: CourseListItem[]
  initialError: string | null
}) {
  const [search, setSearch] = React.useState("")
  const [price, setPrice] = React.useState<PriceFilter>("all")
  const [courses, setCourses] = React.useState(initialCourses)
  const [error, setError] = React.useState(initialError)
  const [enrollingId, setEnrollingId] = React.useState<string | null>(null)
  const [enrollError, setEnrollError] = React.useState<{
    courseId: string
    message: string
  } | null>(null)
  const [pending, startTransition] = React.useTransition()
  const router = useRouter()

  function load(nextSearch: string, nextPrice: PriceFilter) {
    startTransition(async () => {
      const result = await listCourses({
        search: nextSearch,
        price: nextPrice,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setError(null)
      setEnrollError(null)
      setCourses(result.courses)
    })
  }

  async function onEnroll(courseId: string) {
    setEnrollingId(courseId)
    setEnrollError(null)
    const result = await enrollInCourse({ courseId })

    if (!result.ok) {
      setEnrollError({ courseId, message: result.error })
      setEnrollingId(null)
      return
    }

    router.push("/learner/dashboard")
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    load(search, price)
  }

  function onClear() {
    setSearch("")
    load("", price)
  }

  function onPriceChange(value: string | null) {
    if (value !== "all" && value !== "free" && value !== "paid") {
      return
    }

    setPrice(value)
    load(search, value)
  }

  const cardClass =
    "gap-0 overflow-hidden rounded-2xl border border-border bg-card pt-0 shadow-lg ring-0 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60 md:h-full"

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Catalog
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Courses
          </h1>
          <p className="text-sm text-muted-foreground">
            {courses.length === 1 ? "1 course" : `${courses.length} courses`}
          </p>
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-end"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Label htmlFor="course-search">Search</Label>
          <Input
            id="course-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 bg-background"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="course-price">Price</Label>
          <Select items={priceItems} value={price} onValueChange={onPriceChange}>
            <SelectTrigger id="course-price" className="h-11 w-full bg-background sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priceItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            className="h-11 flex-1 bg-primary hover:bg-primary hover:brightness-125 sm:flex-none"
            disabled={pending}
          >
            {pending ? <Spinner /> : <SearchIcon />}
            {pending ? "Searching..." : "Search"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 sm:flex-none"
            onClick={onClear}
            disabled={pending}
          >
            Clear
          </Button>
        </div>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {courses.length === 0 ? (
        <Card className={cardClass}>
          <CardHeader className="py-8">
            <CardTitle>No courses matched</CardTitle>
            <p className="text-sm text-muted-foreground">
              Try a different search or price.
            </p>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className={cardClass}>
              <div className="relative flex h-44 flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
                <div className="absolute inset-0 bg-primary/10" />
                <ImageIcon className="relative size-8" aria-hidden="true" />
                <span className="relative text-xs">Placeholder</span>
                <Badge
                  className={
                    course.price === 0
                      ? "absolute top-3 right-3 bg-muted text-muted-foreground"
                      : "absolute top-3 right-3 shadow-[0_0_24px_color-mix(in_oklab,var(--primary),white_20%)]"
                  }
                >
                  {coursePriceLabel(course.price)}
                </Badge>
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="line-clamp-2 text-lg font-semibold text-foreground">
                  {course.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  By {course.instructorName}
                </p>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {course.description || "No description yet"}
                </p>
              </CardContent>
              <div className="flex flex-col gap-2 border-t border-border p-4 md:mt-auto">
                <Button
                  type="button"
                  className="h-11 w-full bg-primary hover:bg-primary hover:brightness-125"
                  disabled={enrollingId === course.id}
                  onClick={() => onEnroll(course.id)}
                >
                  {enrollingId === course.id ? (
                    <>
                      <Spinner />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll"
                  )}
                </Button>
                {enrollError?.courseId === course.id ? (
                  <p className="text-sm text-destructive">{enrollError.message}</p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
