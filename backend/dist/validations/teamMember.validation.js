"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusSchema = exports.updateProgressSchema = void 0;
const zod_1 = require("zod");
exports.updateProgressSchema = zod_1.z.object({
    progress: zod_1.z
        .number({ message: "Progress must be a number" })
        .int("Progress must be an integer")
        .min(0, "Progress must be at least 0")
        .max(100, "Progress cannot exceed 100"),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "DONE"], {
        message: "Status must be TODO, IN_PROGRESS, or DONE",
    }),
});
