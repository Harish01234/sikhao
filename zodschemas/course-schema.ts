import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, "Add a title."),
  description: z.string().trim(),
  price: z.number({ error: "Add a price." }).min(0, "Price cannot be negative."),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
