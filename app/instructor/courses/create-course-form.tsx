"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createCourseSchema, type CreateCourseInput } from "@/zodschemas/course-schema";

import { createCourse, updateCourse } from "./actions";

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
  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    mode: "onChange",
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
      price: course?.price ?? 0,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = course
      ? await updateCourse(course.id, values)
      : await createCourse(values);

    if (result?.error) {
      form.setError("root", { message: result.error });
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{course ? "Edit course" : "New course"}</CardTitle>
        <CardDescription>
          {course
            ? "Change the title, description, or price."
            : "Add a title and a price. Description is optional."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.title)}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="Course title"
                aria-invalid={Boolean(form.formState.errors.title)}
                {...form.register("title")}
              />
              <FieldError errors={[form.formState.errors.title]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                placeholder="What will people learn?"
                {...form.register("description")}
              />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.price)}>
              <FieldLabel htmlFor="price">Price</FieldLabel>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                aria-invalid={Boolean(form.formState.errors.price)}
                {...form.register("price", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.price]} />
            </Field>
            <FieldError>{form.formState.errors.root?.message}</FieldError>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t-0 bg-transparent">
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving..."
              : course
                ? "Save changes"
                : "Create course"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
