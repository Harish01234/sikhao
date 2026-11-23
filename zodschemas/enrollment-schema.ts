import { z } from "zod";

export const enrollmentSchema = z.object({
  courseId: z.string().trim().min(1, "Choose a course."),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;