"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { lessonSchema, type LessonInput } from "@/zodschemas/lesson-schema";

import {
  createLesson,
  prepareScormUpload,
  prepareVideoUpload,
  saveScormLesson,
  saveVideoLesson,
  updateLesson,
} from "./actions";

const typeItems = [
  { value: "video", label: "Video" },
  { value: "scorm", label: "SCORM" },
];

const fieldClass =
  "h-11 rounded-lg bg-input/30 transition-colors duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50 aria-invalid:border-destructive";

type LessonValues = {
  id: string;
  title: string;
  type: "video" | "scorm";
  hasVideo: boolean;
  hasScorm: boolean;
};

export function LessonForm({
  courseId,
  moduleId,
  lesson,
}: {
  courseId: string;
  moduleId: string;
  lesson?: LessonValues;
}) {
  return (
    <LessonFields key={lesson?.id ?? "new"} courseId={courseId} moduleId={moduleId} lesson={lesson} />
  );
}

function LessonFields({
  courseId,
  moduleId,
  lesson,
}: {
  courseId: string;
  moduleId: string;
  lesson?: LessonValues;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [lessonId, setLessonId] = useState(lesson?.id);
  const [phase, setPhase] = useState<"idle" | "saving" | "uploading" | "processing">("idle");
  const form = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    mode: "onChange",
    defaultValues: {
      title: lesson?.title ?? "",
      type: lesson?.type,
    },
  });
  const type = useWatch({ control: form.control, name: "type" });
  const typeChanged = Boolean(lesson && type && type !== lesson.type);
  const hasFile =
    !typeChanged &&
    ((type === "video" && lesson?.hasVideo) || (type === "scorm" && lesson?.hasScorm));

  const onSubmit = form.handleSubmit(async (values) => {
    const file = fileRef.current?.files?.[0];
    form.clearErrors("root");

    if (!hasFile && !file) {
      form.setError("root", {
        message: values.type === "video" ? "Choose an MP4 video." : "Choose a SCORM zip.",
      });
      return;
    }

    if (file && values.type === "video" && !file.name.toLowerCase().endsWith(".mp4")) {
      form.setError("root", { message: "Choose an MP4 video." });
      return;
    }

    if (file && values.type === "scorm" && !file.name.toLowerCase().endsWith(".zip")) {
      form.setError("root", { message: "Choose a .zip SCORM package." });
      return;
    }

    let done = false;

    try {
      setPhase("saving");
      const id = await saveLessonRow(courseId, moduleId, lessonId, values);
      setLessonId(id);

      if (file && values.type === "video") {
        setPhase("uploading");
        const length = await readVideoLength(file);
        const upload = await prepareVideoUpload(courseId, moduleId, id);

        if ("error" in upload) {
          form.setError("root", { message: upload.error });
          return;
        }

        await putFile(upload.url, file, "video/mp4");
        setPhase("processing");
        const saved = await saveVideoLesson(courseId, moduleId, id, length);

        if ("error" in saved) {
          form.setError("root", { message: saved.error });
          return;
        }
      }

      if (file && values.type === "scorm") {
        setPhase("uploading");
        const upload = await prepareScormUpload(courseId, moduleId, id);

        if ("error" in upload) {
          form.setError("root", { message: upload.error });
          return;
        }

        await putFile(upload.url, file, "application/zip");
        setPhase("processing");
        const saved = await saveScormLesson(courseId, moduleId, id);

        if ("error" in saved) {
          form.setError("root", { message: saved.error });
          return;
        }
      }

      done = true;
      router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons`);
      router.refresh();
    } catch (error) {
      form.setError("root", { message: messageFrom(error) });
    } finally {
      if (!done) {
        setPhase("idle");
      }
    }
  });

  const buttonLabel =
    phase === "uploading"
      ? "Uploading..."
      : phase === "processing"
        ? "Saving file..."
        : phase === "saving"
          ? "Saving..."
          : lesson
            ? "Save changes"
            : "Create lesson";

  return (
    <Card className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-lg ring-0">
      <CardHeader>
        <CardTitle>{lesson ? "Edit lesson" : "New lesson"}</CardTitle>
        <CardDescription>
          {lesson
            ? "Change the title, or replace the file."
            : "Add a title, choose video or SCORM, and upload the file."}
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
                    <FormDescription>The name learners will see for this lesson.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      items={typeItems}
                      value={field.value}
                      onValueChange={(value) => {
                        if (value === "video" || value === "scorm") {
                          field.onChange(value);
                          if (fileRef.current) {
                            fileRef.current.value = "";
                          }
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className={cn(fieldClass, "w-full")}>
                          <SelectValue placeholder="Choose a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Video is one MP4. SCORM is a zip package.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium text-foreground">File</h2>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lesson-file">{type === "scorm" ? "SCORM package" : "Video"}</Label>
                <Input
                  ref={fileRef}
                  id="lesson-file"
                  type="file"
                  accept={type === "scorm" ? ".zip,application/zip" : ".mp4,video/mp4"}
                  disabled={!type || phase !== "idle"}
                  aria-invalid={Boolean(form.formState.errors.root)}
                  className={fieldClass}
                />
                <p className="text-sm text-muted-foreground">
                  {!type
                    ? "Choose a type first."
                    : type === "scorm"
                      ? hasFile
                        ? "A SCORM package is already saved. Choose a new zip to replace it."
                        : "Zip file with the SCORM manifest inside."
                      : hasFile
                        ? "A video is already saved. Choose a new MP4 to replace it."
                        : "MP4 file."}
                </p>
                {form.formState.errors.root?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                ) : null}
              </div>
            </section>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t-0 bg-transparent sm:flex-row sm:justify-end">
            <Link
              href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons`}
              className={cn(buttonVariants({ variant: "ghost" }), "h-11 w-full sm:w-auto")}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              className="h-11 w-full bg-primary hover:bg-primary hover:brightness-125 sm:w-auto"
              disabled={phase !== "idle"}
            >
              {phase !== "idle" ? <Spinner /> : null}
              {buttonLabel}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

async function saveLessonRow(
  courseId: string,
  moduleId: string,
  lessonId: string | undefined,
  values: LessonInput,
) {
  if (!lessonId) {
    const created = await createLesson(courseId, moduleId, values);

    if ("error" in created) {
      throw new Error(created.error);
    }

    return created.lessonId;
  }

  const updated = await updateLesson(courseId, moduleId, lessonId, values);

  if ("error" in updated) {
    throw new Error(updated.error);
  }

  return lessonId;
}

function readVideoLength(file: File) {
  return new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const seconds = Math.round(video.duration);
      URL.revokeObjectURL(url);
      if (!Number.isFinite(seconds) || seconds < 0) {
        reject(new Error("That video could not be read."));
        return;
      }
      resolve(seconds);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That video could not be read."));
    };
    video.src = url;
  });
}

async function putFile(url: string, file: File, contentType: string) {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!response.ok) {
    throw new Error("The file could not be uploaded.");
  }
}

function messageFrom(error: unknown) {
  if (
    error instanceof Error &&
    /^(The |That |Choose |Only |Upload |Add |Check )/.test(error.message)
  ) {
    return error.message;
  }

  return "The file could not be uploaded.";
}
