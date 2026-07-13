"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  BarChart2,
  Settings,
  FileText,
  User as UserIcon,
  X,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Define navigation rules based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case "ADMIN":
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Users", href: "/dashboard/users", icon: Users },
          { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
          { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
          { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
          { name: "Settings", href: "/dashboard/settings", icon: Settings },
        ];
      case "PROJECT_MANAGER":
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
          { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
          { name: "Settings", href: "/dashboard/settings", icon: Settings },
        ];
      case "TEAM_MEMBER":
      default:
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "My Projects", href: "/dashboard/my-projects", icon: Briefcase },
          { name: "My Tasks", href: "/dashboard/my-tasks", icon: CheckSquare },
          { name: "Settings", href: "/dashboard/settings", icon: Settings },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <div className="flex h-full flex-col bg-white border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
      <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          WorkSync
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
