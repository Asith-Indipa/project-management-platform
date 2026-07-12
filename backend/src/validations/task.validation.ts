import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    message: "Priority must be LOW, MEDIUM, or HIGH",
  }).optional(),
  projectId: z.number({ message: "Project ID must be a number" }),
  assignedToId: z.number({ message: "Assigned User ID must be a number" }),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    message: "Priority must be LOW, MEDIUM, or HIGH",
  }).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
    message: "Status must be TODO, IN_PROGRESS, or DONE",
  }).optional(),
  assignedToId: z.number().optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

export const assignTaskSchema = z.object({
  assignedToId: z.number({ message: "Assigned User ID must be a number" }),
});

export const updateStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
    message: "Status must be TODO, IN_PROGRESS, or DONE",
  }),
});
