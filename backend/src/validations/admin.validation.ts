import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address format"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"], {
    message: "Role must be ADMIN, PROJECT_MANAGER, or TEAM_MEMBER",
  }),
});

export const updateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"], {
    message: "Role must be ADMIN, PROJECT_MANAGER, or TEAM_MEMBER",
  }).optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"], {
    message: "Role must be ADMIN, PROJECT_MANAGER, or TEAM_MEMBER",
  }),
});
