import React from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Terminal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-primary/30 bg-primary/5 mb-8">
            <Terminal size={28} className="text-primary" />
          </div>

          <div className="font-mono text-primary text-xs uppercase tracking-widest mb-4">
            404 — Page Not Found
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Lost in the stack.
          </h1>

          <p className="text-muted-foreground font-mono text-sm mb-10 leading-relaxed">
            This page doesn't exist. It might have been moved, deleted,<br className="hidden sm:block" />
            or maybe you mistyped the URL.
          </p>

          <div className="bg-black/60 border border-border/40 rounded-none p-4 font-mono text-sm mb-10 text-left">
            <span className="text-primary">❯</span>{" "}
            <span className="text-muted-foreground">lokadev open </span>
            <span className="text-white">--help</span>
            <div className="mt-2 pl-4 border-l border-border/40 text-muted-foreground text-xs space-y-1">
              <div><span className="text-green-400">✓</span> Try /docs for documentation</div>
              <div><span className="text-green-400">✓</span> Try /download for installers</div>
              <div><span className="text-green-400">✓</span> Try /app for the live demo</div>
            </div>
          </div>

          <Link href="/">
            <Button size="lg" className="font-mono gap-2 rounded-none">
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
