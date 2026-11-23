"use server";

import { getAuthSession } from "@/lib/auth-redirect";
import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";
import {
  courseListSchema,
  type CourseListItem,
} from "@/zodschemas/course-list-schema";
import { enrollmentSchema } from "@/zodschemas/enrollment-schema";

export async function listCourses(values: unknown): Promise<
  { ok: true; courses: CourseListItem[] } | { ok: false; error: string }
> {
  const parsed = courseListSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the search.",
    };
  }

  const { search, price } = parsed.data;
  const where: Prisma.CourseWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { instructor: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (price === "free") {
    where.price = { equals: 0 };
  }

  if (price === "paid") {
    where.price = { gt: 0 };
  }

  try {
    const rows = await prisma.course.findMany({
      where,
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        instructor: { select: { name: true } },
      },
    });

    return {
      ok: true,
      courses: rows.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description ?? "",
        price: Number(course.price),
        instructorName: course.instructor.name,
      })),
    };
  } catch {
    return { ok: false, error: "Courses could not be loaded." };
  }
}

export async function enrollInCourse(values: unknown): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await getAuthSession();

  if (!session) {
    return { ok: false, error: "Sign in to enroll." };
  }

  if (session.user.role !== "learner") {
    return { ok: false, error: "Only a learner can enroll." };
  }

  const parsed = enrollmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Choose a course.",
    };
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
  });

  if (!course) {
    return { ok: false, error: "That course was not found." };
  }

  const existing = await prisma.courseEnrollment.findUnique({
    where: {
      learnerId_courseId: {
        learnerId: session.user.id,
        courseId: course.id,
      },
    },
  });

  if (existing) {
    return { ok: false, error: "You are already enrolled." };
  }

  try {
    await prisma.courseEnrollment.create({
      data: {
        courseId: course.id,
        learnerId: session.user.id,
        price: course.price,
        status: "active",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "You are already enrolled." };
    }

    return { ok: false, error: "The enrollment could not be saved." };
  }

  return { ok: true };
}


