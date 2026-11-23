import { z } from "zod";

export const courseListSchema = z.object({
  search: z.string().trim(),
  price: z.enum(["all", "free", "paid"], { error: "Choose a price filter." }),
});

export type CourseListInput = z.infer<typeof courseListSchema>;

export type CourseListItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  instructorName: string;
};
