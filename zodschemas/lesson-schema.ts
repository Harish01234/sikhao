import { z } from "zod";

export const lessonSchema = z.object({
  title: z.string().trim().min(1, "Add a title."),
  type: z.enum(["video", "scorm"], { error: "Choose video or SCORM." }),
});

export type LessonInput = z.infer<typeof lessonSchema>;
