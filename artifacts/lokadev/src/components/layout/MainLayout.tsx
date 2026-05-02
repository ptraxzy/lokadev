import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col noise-bg">
      <Navbar />
      <main className="flex-1 z-10 relative">
        {children}
      </main>
      <Footer />
    </div>
  );
}
