import { z } from "zod";

export const moduleSchema = z.object({
  title: z.string().trim().min(1, "Add a title."),
});

export type ModuleInput = z.infer<typeof moduleSchema>;
