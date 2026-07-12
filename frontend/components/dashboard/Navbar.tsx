"use client";

import React from "react";
import { Menu } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import UserProfileDropdown from "./UserProfileDropdown";

interface NavbarProps {
  onMenuOpen: () => void;
}

export default function Navbar({ onMenuOpen }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 md:px-8 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 transition-colors">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu button for Mobile only */}
        <button
          onClick={onMenuOpen}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Dynamic Breadcrumb path indicator */}
        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User profile dropdown menu */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}
