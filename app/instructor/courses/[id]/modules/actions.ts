"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-redirect";
import { prisma } from "@/src/lib/prisma";
import { moduleSchema } from "@/zodschemas/module-schema";

async function ownedCourse(courseId: string) {
  const session = await getAuthSession();

  if (session?.user.role !== "instructor") {
    return { error: "Only an instructor can change a module." };
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId: session.user.id },
  });

  if (!course) {
    return { error: "That course was not found." };
  }

  return { course };
}

async function nextModulePosition(courseId: string) {
  const latest = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return (latest?.position ?? 0) + 1;
}

export async function createModule(courseId: string, values: unknown) {
  const owned = await ownedCourse(courseId);

  if ("error" in owned) {
    return { error: owned.error };
  }

  const parsed = moduleSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  await prisma.module.create({
    data: {
      title: parsed.data.title,
      courseId: owned.course.id,
      position: await nextModulePosition(owned.course.id),
    },
  });

  redirect(`/instructor/courses/${owned.course.id}/modules`);
}

export async function updateModule(courseId: string, moduleId: string, values: unknown) {
  const owned = await ownedCourse(courseId);

  if ("error" in owned) {
    return { error: owned.error };
  }

  const parsed = moduleSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: owned.course.id },
  });

  if (!module) {
    return { error: "That module was not found." };
  }

  await prisma.module.update({
    where: { id: module.id },
    data: { title: parsed.data.title },
  });

  redirect(`/instructor/courses/${owned.course.id}/modules`);
}

export async function deleteModule(courseId: string, moduleId: string) {
  const owned = await ownedCourse(courseId);

  if ("error" in owned) {
    return { error: owned.error };
  }

  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: owned.course.id },
  });

  if (!module) {
    return { error: "That module was not found." };
  }

  await prisma.module.delete({
    where: { id: module.id },
  });

  revalidatePath(`/instructor/courses/${owned.course.id}/modules`);
  return { ok: true };
}
