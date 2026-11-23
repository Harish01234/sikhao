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
import { moduleSchema, type ModuleInput } from "@/zodschemas/module-schema";

import { createModule, updateModule } from "./actions";

const fieldClass =
  "h-11 rounded-lg bg-input/30 transition-colors duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50 aria-invalid:border-destructive";

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
    <Card className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-lg ring-0">
      <CardHeader>
        <CardTitle>{module ? "Edit module" : "New module"}</CardTitle>
        <CardDescription>
          {module ? "Change the module title." : "Add a title for this module."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium text-foreground">Module</h2>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormDescription>The name of this section.</FormDescription>
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
              href={`/instructor/courses/${courseId}/modules`}
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
              {form.formState.isSubmitting ? "Saving..." : module ? "Save changes" : "Create module"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
