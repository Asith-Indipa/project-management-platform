"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusSchema = exports.assignTaskSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Task title is required"),
    description: zod_1.z.string().optional().nullable(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"], {
        message: "Priority must be LOW, MEDIUM, or HIGH",
    }).optional(),
    projectId: zod_1.z.number({ message: "Project ID must be a number" }),
    assignedToId: zod_1.z.number().optional().nullable(),
    dueDate: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Task title is required").optional(),
    description: zod_1.z.string().optional().nullable(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"], {
        message: "Priority must be LOW, MEDIUM, or HIGH",
    }).optional(),
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "DONE"], {
        message: "Status must be TODO, IN_PROGRESS, or DONE",
    }).optional(),
    progress: zod_1.z.number({ message: "Progress must be a number" }).int("Progress must be an integer").min(0, "Progress must be at least 0").max(100, "Progress cannot exceed 100").optional(),
    assignedToId: zod_1.z.number().optional().nullable(),
    dueDate: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});
exports.assignTaskSchema = zod_1.z.object({
    assignedToId: zod_1.z.number({ message: "Assigned User ID must be a number" }),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "DONE"], {
        message: "Status must be TODO, IN_PROGRESS, or DONE",
    }),
});
