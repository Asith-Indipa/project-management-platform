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
    <nav className="flex items-center space-x-1.5 text-sm text-muted-foreground font-medium">
      <Link
        href="/dashboard"
        className="flex items-center justify-center p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-all duration-200"
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
            <ChevronRight className="h-4 w-4 text-border" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[150px] px-1.5">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="px-1.5 py-1 rounded-md hover:bg-muted hover:text-foreground transition-all duration-200"
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
