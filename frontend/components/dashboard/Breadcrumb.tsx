"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb() {
  const pathname = usePathname();
  
  // Split pathname into segments, removing empty items
  const segments = pathname.split("/").filter((item) => item !== "");

  return (
    <nav className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {segments.map((segment, index) => {
        // Build route path for the current segment link
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        
        // Skip rendering "dashboard" if it's the only segment or if it's just the home
        if (segment === "dashboard" && index === 0) return null;

        // Beautify segment name (e.g. "project-manager" -> "Project Manager")
        const label = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
            {isLast ? (
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
