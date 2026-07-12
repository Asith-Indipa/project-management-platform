import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white py-4 px-6 dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <p>© {currentYear} WorkSync. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">Terms of Service</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
