import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import teamMemberRoutes from "./routes/teamMember.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import * as taskController from "./controllers/task.controller";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/team-member", teamMemberRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/api/my-tasks", authMiddleware, taskController.getMyTasks);

export default app;
