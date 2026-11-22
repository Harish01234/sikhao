"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCourseSchema } from "@/zodschemas/course-schema";
import { getAuthSession } from "@/lib/auth-redirect";
import { prisma } from "@/src/lib/prisma";

async function ownedCourse(courseId: string) {
  const session = await getAuthSession();

  if (session?.user.role !== "instructor") {
    return { error: "Only an instructor can change a course." };
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId: session.user.id },
  });

  if (!course) {
    return { error: "That course was not found." };
  }

  return { course };
}

export async function createCourse(values: unknown) {
  const session = await getAuthSession();

  if (session?.user.role !== "instructor") {
    return { error: "Only an instructor can create a course." };
  }

  const parsed = createCourseSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  await prisma.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price,
      instructorId: session.user.id,
    },
  });

  redirect("/instructor/courses");
}

export async function updateCourse(courseId: string, values: unknown) {
  const owned = await ownedCourse(courseId);

  if ("error" in owned) {
    return { error: owned.error };
  }

  const parsed = createCourseSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  await prisma.course.update({
    where: { id: owned.course.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price,
    },
  });

  redirect("/instructor/courses");
}

export async function deleteCourse(courseId: string) {
  const owned = await ownedCourse(courseId);

  if ("error" in owned) {
    return { error: owned.error };
  }

  await prisma.course.delete({
    where: { id: owned.course.id },
  });

  revalidatePath("/instructor/courses");
  return { ok: true };
}
