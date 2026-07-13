"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignMemberSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Project name must be at least 3 characters long"),
    description: zod_1.z.string().optional().nullable(),
    managerId: zod_1.z.number({ message: "Manager ID must be a number" }),
    startDate: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    endDate: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    status: zod_1.z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"]).optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Project name must be at least 3 characters long").optional(),
    description: zod_1.z.string().optional().nullable(),
    managerId: zod_1.z.number().optional(),
    startDate: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    endDate: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    status: zod_1.z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"]).optional(),
});
exports.assignMemberSchema = zod_1.z.object({
    userId: zod_1.z.number({ message: "User ID must be a number" }),
});
