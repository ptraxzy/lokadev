import React from "react";
import { Link } from "wouter";
import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
                <Terminal size={18} />
              </div>
              <span className="font-mono font-bold text-lg tracking-tight">LokaDev</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              The next-generation local development environment. Fast, isolated, and natively cross-platform.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/docs#installation" className="hover:text-primary transition-colors">Installation</Link></li>
              <li><Link href="/docs#features" className="hover:text-primary transition-colors">Features</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/download" className="hover:text-primary transition-colors">Download</Link></li>
              <li><a href="https://github.com" className="hover:text-primary transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discord Community</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LokaDev. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
