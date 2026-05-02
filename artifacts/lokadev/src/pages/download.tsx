import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Download, Monitor, TerminalSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Download LokaDev</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the fastest, most powerful local development environment for your machine. 
            Free and open-source forever.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Windows Download Card */}
          <div className="bg-card border border-border/60 rounded-xl p-8 flex flex-col hover:border-primary/50 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/80 rounded-lg flex items-center justify-center text-primary border border-border">
                  <Monitor size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Windows</h2>
                  <p className="text-sm text-muted-foreground font-mono">v1.0.4 • Windows 10/11 (64-bit)</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-sm text-muted-foreground">
                <p>Includes:</p>
                <ul className="space-y-2 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">✓</span> LokaDev Core Engine
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">✓</span> Nginx & Apache
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">✓</span> PHP, Node.js, Python managers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">✓</span> MySQL & PostgreSQL
                  </li>
                </ul>
              </div>
            </div>

            <Button className="w-full h-12 font-mono text-sm gap-2 mt-auto" size="lg">
              <Download size={18} />
              Download .exe
            </Button>
          </div>

          {/* Linux Download Card */}
          <div className="bg-card border border-border/60 rounded-xl p-8 flex flex-col hover:border-primary/50 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/80 rounded-lg flex items-center justify-center text-primary border border-border">
                  <TerminalSquare size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Linux</h2>
                  <p className="text-sm text-muted-foreground font-mono">v1.0.4 • Debian/Ubuntu/Fedora</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-sm text-muted-foreground">
                <p>Available formats:</p>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary">
                    <Download size={16} className="mr-3 text-primary" />
                    Download .deb (Debian/Ubuntu)
                  </Button>
                  <Button variant="outline" className="justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary">
                    <Download size={16} className="mr-3 text-primary" />
                    Download .rpm (Fedora/RHEL)
                  </Button>
                  <Button variant="outline" className="justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary">
                    <Download size={16} className="mr-3 text-primary" />
                    Download .AppImage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-secondary/30 border border-border/40 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="text-primary shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-foreground mb-1">System Requirements</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              LokaDev requires at least 4GB of RAM (8GB recommended) and 2GB of free disk space. 
              Hardware virtualization must be enabled in your BIOS/UEFI settings for container isolation features.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
