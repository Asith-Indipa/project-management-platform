import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background/30 backdrop-blur-md py-4 px-6 transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>© {currentYear} WorkSync. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span>
          <span className="font-semibold text-primary">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
