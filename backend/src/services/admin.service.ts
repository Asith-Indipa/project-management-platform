import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const createUser = async (userData: any) => {
  const { name, email, password, role } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return newUser;
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUser = async (id: number, updateData: any) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });
};

export const deleteUser = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.delete({
    where: { id },
  });

  return { message: "User deleted successfully" };
};

export const changeUserRole = async (id: number, role: Role) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });
};

export const getSystemStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalProjects = await prisma.project.count();
  const totalTasks = await prisma.task.count();
  
  const completedTasks = await prisma.task.count({
    where: { status: "COMPLETED" },
  });
  
  const pendingTasks = await prisma.task.count({
    where: { status: "PENDING" },
  });

  return {
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
  };
};

export const getAllProjects = async () => {
  return prisma.project.findMany({
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });
};
