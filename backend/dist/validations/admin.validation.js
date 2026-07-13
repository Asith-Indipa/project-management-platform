"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeRoleSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, "Name is required")
        .min(3, "Name must be at least 3 characters"),
    email: zod_1.z.string()
        .min(1, "Email is required")
        .email("Invalid email address format"),
    password: zod_1.z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
    role: zod_1.z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"], {
        message: "Role must be ADMIN, PROJECT_MANAGER, or TEAM_MEMBER",
    }),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name must be at least 3 characters").optional(),
    role: zod_1.z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"], {
        message: "Role must be ADMIN, PROJECT_MANAGER, or TEAM_MEMBER",
    }).optional(),
});
exports.changeRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"], {
        message: "Role must be ADMIN, PROJECT_MANAGER, or TEAM_MEMBER",
    }),
});
