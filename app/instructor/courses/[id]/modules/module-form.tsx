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
import { moduleSchema, type ModuleInput } from "@/zodschemas/module-schema";

import { createModule, updateModule } from "./actions";

export function ModuleForm({
  courseId,
  module,
}: {
  courseId: string;
  module?: {
    id: string;
    title: string;
  };
}) {
  return <ModuleFields key={module?.id ?? "new"} courseId={courseId} module={module} />;
}

function ModuleFields({
  courseId,
  module,
}: {
  courseId: string;
  module?: {
    id: string;
    title: string;
  };
}) {
  const form = useForm<ModuleInput>({
    resolver: zodResolver(moduleSchema),
    mode: "onChange",
    defaultValues: {
      title: module?.title ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = module
      ? await updateModule(courseId, module.id, values)
      : await createModule(courseId, values);

    if (result?.error) {
      form.setError("root", { message: result.error });
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{module ? "Edit module" : "New module"}</CardTitle>
        <CardDescription>
          {module ? "Change the module title." : "Add a title for this module."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.title)}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="Module title"
                aria-invalid={Boolean(form.formState.errors.title)}
                {...form.register("title")}
              />
              <FieldError errors={[form.formState.errors.title]} />
            </Field>
            <FieldError>{form.formState.errors.root?.message}</FieldError>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t-0 bg-transparent">
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving..."
              : module
                ? "Save changes"
                : "Create module"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
