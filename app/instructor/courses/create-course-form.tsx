"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { createCourseSchema, type CreateCourseInput } from "@/zodschemas/course-schema";

import { createCourse, updateCourse } from "./actions";

const fieldClass =
  "h-11 rounded-lg bg-input/30 transition-colors duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50 aria-invalid:border-destructive";

export function CreateCourseForm({
  course,
}: {
  course?: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
}) {
  return <CourseFields key={course?.id ?? "new"} course={course} />;
}

function CourseFields({
  course,
}: {
  course?: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
}) {
  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    mode: "onChange",
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
      price: course?.price,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = course ? await updateCourse(course.id, values) : await createCourse(values);

    if (result?.error) {
      form.setError("root", { message: result.error });
    }
  });

  return (
    <Card className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-lg ring-0">
      <CardHeader>
        <CardTitle>{course ? "Edit course" : "New course"}</CardTitle>
        <CardDescription>
          {course ? "Change the title, description, or price." : "Add a title and a price. Description is optional."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium text-foreground">Details</h2>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormDescription>The name learners will see.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormDescription>Optional. A short line about this course.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium text-foreground">Price</h2>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className={fieldClass}
                        name={field.name}
                        ref={field.ref}
                        value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : ""}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? Number.NaN : event.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormDescription>Use 0 for a free course.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
            {form.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t-0 bg-transparent sm:flex-row sm:justify-end">
            <Link
              href="/instructor/courses"
              className={cn(buttonVariants({ variant: "ghost" }), "h-11 w-full sm:w-auto")}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              className="h-11 w-full bg-primary hover:bg-primary hover:brightness-125 sm:w-auto"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <Spinner /> : null}
              {form.formState.isSubmitting ? "Saving..." : course ? "Save changes" : "Create course"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
