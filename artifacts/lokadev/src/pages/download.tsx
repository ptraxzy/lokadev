import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Download, Monitor, TerminalSquare, AlertCircle, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB = "https://github.com/ptraxzy/lokadev";
const RELEASES = `${GITHUB}/releases/latest`;
const VERSION = "1.0.4";

const dlUrl = (file: string) => `${GITHUB}/releases/latest/download/${file}`;

export default function DownloadPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-none mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            v{VERSION} — Latest Stable Release
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Download LokaDev</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono">
            Free and open-source forever. No license key, no telemetry, no bullshit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Windows */}
          <div className="bg-card border border-border/60 rounded-none p-8 flex flex-col hover:border-primary/50 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/80 flex items-center justify-center text-primary border border-border">
                  <Monitor size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-mono">Windows</h2>
                  <p className="text-sm text-muted-foreground font-mono">v{VERSION} · Windows 10/11 (64-bit)</p>
                </div>
              </div>
              <ul className="space-y-2 mb-8 text-sm text-muted-foreground font-mono">
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> LokaDev Core Engine</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> Nginx & Apache bundled</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> PHP, Node.js, Python runtime managers</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> MySQL & PostgreSQL</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> mkcert local SSL</li>
              </ul>
            </div>
            <a href={dlUrl("lokadev.exe")} className="block">
              <Button className="w-full h-12 font-mono text-sm gap-2 rounded-none bg-primary hover:bg-primary/90" size="lg">
                <Download size={18} />
                Download lokadev.exe
              </Button>
            </a>
            <p className="text-xs text-muted-foreground font-mono text-center mt-3 opacity-60">
              Run as Administrator for full features
            </p>
          </div>

          {/* Linux */}
          <div className="bg-card border border-border/60 rounded-none p-8 flex flex-col hover:border-primary/50 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/80 flex items-center justify-center text-primary border border-border">
                  <TerminalSquare size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-mono">Linux</h2>
                  <p className="text-sm text-muted-foreground font-mono">v{VERSION} · x86_64</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-4">Available formats:</p>
              <div className="grid grid-cols-1 gap-3 mb-8">
                <a href={dlUrl(`lokadev_${VERSION}_amd64.deb`)}>
                  <Button variant="outline" className="w-full justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary rounded-none">
                    <Download size={16} className="mr-3 text-primary" />
                    .deb — Debian / Ubuntu / Mint
                  </Button>
                </a>
                <a href={dlUrl(`lokadev-${VERSION}.x86_64.rpm`)}>
                  <Button variant="outline" className="w-full justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary rounded-none">
                    <Download size={16} className="mr-3 text-primary" />
                    .rpm — Fedora / RHEL / openSUSE
                  </Button>
                </a>
                <a href={dlUrl(`LokaDev-${VERSION}-x86_64.AppImage`)}>
                  <Button variant="outline" className="w-full justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary rounded-none">
                    <Download size={16} className="mr-3 text-primary" />
                    .AppImage — Universal Linux
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Install via script */}
        <div className="border border-border/40 bg-black/40 p-6 font-mono mb-8">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">Or install via script (Linux)</p>
          <div className="flex items-center gap-3">
            <span className="text-primary select-none">$</span>
            <code className="text-sm text-foreground">
              curl -sSL https://raw.githubusercontent.com/ptraxzy/lokadev/main/install.sh | bash
            </code>
          </div>
        </div>

        {/* GitHub releases link */}
        <div className="flex justify-center mb-10">
          <a href={RELEASES} target="_blank" rel="noreferrer">
            <Button variant="ghost" className="font-mono text-sm gap-2 text-muted-foreground hover:text-primary">
              <Github size={16} />
              View all releases on GitHub
              <ExternalLink size={12} />
            </Button>
          </a>
        </div>

        {/* Requirements */}
        <div className="border border-border/40 bg-secondary/20 p-6 flex items-start gap-4">
          <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="font-semibold text-foreground mb-1 font-mono text-sm">System Requirements</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-mono">
              4 GB RAM minimum (8 GB recommended) · 2 GB disk space · x86_64 CPU ·{" "}
              Linux: kernel 5.x+ with user namespaces enabled ·{" "}
              Windows: Windows 10 build 1903+ or Windows 11
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
