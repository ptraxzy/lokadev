import React from "react";
import { Link, useLocation } from "wouter";
import { Terminal, Download, FileText, Github, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Terminal size={18} />
          </div>
          <span className="font-mono font-bold text-lg tracking-tight">LokaDev</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/docs" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/docs' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Documentation
          </Link>
          <a href="https://github.com/ptraxzy/lokadev" target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
            <Github size={16} /> GitHub
          </a>
          <Link href="/download" data-testid="nav-download">
            <Button variant="default" className="font-mono" size="sm">
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </Link>
        </nav>

        <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={toggleMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border/40 bg-background px-4 py-4 space-y-4">
          <Link href="/docs" className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={toggleMenu}>
            Documentation
          </Link>
          <a href="https://github.com/ptraxzy/lokadev" target="_blank" rel="noreferrer" className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={toggleMenu}>
            GitHub
          </a>
          <Link href="/download" className="block" onClick={toggleMenu}>
            <Button variant="default" className="w-full font-mono">
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
