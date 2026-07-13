"use client";

import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import Footer from "@/components/dashboard/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
        {/* Desktop Sidebar (Fixed Left) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar (Slide-out Drawer) */}
        {mobileMenuOpen && (
          <div className="relative z-50 md:hidden">
            {/* Overlay backdrop */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer container */}
            <div className="fixed inset-y-0 left-0 w-64 shadow-2xl animate-in slide-in-from-left duration-200">
              <Sidebar onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Work Area */}
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar onMenuOpen={() => setMobileMenuOpen(true)} />
          <main className="flex-1 px-4 py-8 md:px-8">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
