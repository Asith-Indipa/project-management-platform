import { z } from "zod";

export const updateProgressSchema = z.object({
  progress: z
    .number({ message: "Progress must be a number" })
    .int("Progress must be an integer")
    .min(0, "Progress must be at least 0")
    .max(100, "Progress cannot exceed 100"),
});

export const updateStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
    message: "Status must be TODO, IN_PROGRESS, or DONE",
  }),
});
