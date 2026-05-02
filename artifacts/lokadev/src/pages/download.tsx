import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Download, Monitor, TerminalSquare, AlertCircle, Github,
  ExternalLink, LayoutDashboard, AppWindow,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB = "https://github.com/ptraxzy/lokadev";
const RELEASES = `${GITHUB}/releases/latest`;
const VERSION = "1.0.4";

const dlUrl = (file: string) => `${GITHUB}/releases/latest/download/${file}`;

export default function DownloadPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-none mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            v{VERSION} — Latest Stable Release
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Download LokaDev</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono">
            Free and open-source forever. No license key, no telemetry.
          </p>
        </div>

        {/* ── CLI SECTION ── */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TerminalSquare size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-lg">CLI — Command Line Interface</h2>
              <p className="text-xs text-muted-foreground font-mono">Lightweight binary. Manages projects, services, and databases.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Windows CLI */}
            <div className="bg-card border border-border/60 rounded-none p-8 flex flex-col hover:border-primary/50 transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-secondary/80 flex items-center justify-center text-primary border border-border">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono">Windows CLI</h3>
                    <p className="text-sm text-muted-foreground font-mono">v{VERSION} · Windows 10/11 64-bit</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-8 text-sm text-muted-foreground font-mono">
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Single binary, no installer needed</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Full project management via CLI</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Starts web dashboard at :25000</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> MySQL, PostgreSQL, Redis support</li>
                </ul>
              </div>
              <a href={dlUrl("lokadev.exe")} className="block">
                <Button className="w-full h-12 font-mono text-sm gap-2 rounded-none bg-primary hover:bg-primary/90" size="lg">
                  <Download size={18} /> Download lokadev.exe
                </Button>
              </a>
              <p className="text-xs text-muted-foreground font-mono text-center mt-3 opacity-60">
                Add to PATH for global access
              </p>
            </div>

            {/* Linux CLI */}
            <div className="bg-card border border-border/60 rounded-none p-8 flex flex-col hover:border-primary/50 transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-secondary/80 flex items-center justify-center text-primary border border-border">
                    <TerminalSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono">Linux CLI</h3>
                    <p className="text-sm text-muted-foreground font-mono">v{VERSION} · x86_64 / arm64</p>
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
                  <a href={dlUrl(`LokaDev-CLI-${VERSION}-x86_64.AppImage`)}>
                    <Button variant="outline" className="w-full justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary rounded-none">
                      <Download size={16} className="mr-3 text-primary" />
                      .AppImage — Universal Linux
                    </Button>
                  </a>
                  <a href={dlUrl(`lokadev-linux-arm64`)}>
                    <Button variant="outline" className="w-full justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary rounded-none">
                      <Download size={16} className="mr-3 text-primary" />
                      Binary — Linux arm64
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Install via script */}
          <div className="border border-border/40 bg-black/40 p-6 font-mono mb-3">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">Quick install — Linux</p>
            <div className="flex items-center gap-3">
              <span className="text-primary select-none">$</span>
              <code className="text-sm text-foreground select-all">
                curl -sSL https://raw.githubusercontent.com/ptraxzy/lokadev/main/install.sh | bash
              </code>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 my-10" />

        {/* ── DESKTOP APP SECTION ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
              <AppWindow size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-lg">Desktop App — Native GUI</h2>
              <p className="text-xs text-muted-foreground font-mono">
                Full windowed application. System tray, project dashboard, one-click start/stop.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Windows Desktop */}
            <div className="bg-card border border-primary/30 rounded-none p-8 flex flex-col hover:border-primary/60 transition-colors relative overflow-hidden group">
              <div className="absolute top-3 right-3 text-[10px] font-mono text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 uppercase tracking-widest">
                Recommended
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary border border-primary/30">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono">Windows Desktop</h3>
                    <p className="text-sm text-muted-foreground font-mono">v{VERSION} · Windows 10/11 64-bit</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-8 text-sm text-muted-foreground font-mono">
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Native windowed app — no browser needed</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> System tray icon with quick actions</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Auto-starts daemon on launch</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Start/stop projects with one click</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Minimizes to tray — always running</li>
                </ul>
              </div>
              <a href={dlUrl(`LokaDev_${VERSION}_x64_en-US.msi`)} className="block">
                <Button className="w-full h-12 font-mono text-sm gap-2 rounded-none bg-primary hover:bg-primary/90" size="lg">
                  <Download size={18} /> Download .msi Installer
                </Button>
              </a>
              <p className="text-xs text-muted-foreground font-mono text-center mt-3 opacity-60">
                Installs LokaDev + adds to Start Menu
              </p>
            </div>

            {/* Linux Desktop */}
            <div className="bg-card border border-border/60 rounded-none p-8 flex flex-col hover:border-primary/50 transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-secondary/80 flex items-center justify-center text-primary border border-border">
                    <LayoutDashboard size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono">Linux Desktop</h3>
                    <p className="text-sm text-muted-foreground font-mono">v{VERSION} · x86_64</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground font-mono">
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Native GTK + WebKitGTK window</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> System tray via libayatana</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Works on Fedora, Ubuntu, Debian, Arch</li>
                </ul>
                <div className="grid grid-cols-1 gap-3 mb-8">
                  <a href={dlUrl(`lokadev-desktop_${VERSION}_amd64.deb`)}>
                    <Button variant="outline" className="w-full justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary rounded-none">
                      <Download size={16} className="mr-3 text-primary" />
                      .deb — Debian / Ubuntu
                    </Button>
                  </a>
                  <a href={dlUrl(`LokaDev-Desktop_${VERSION}_amd64.AppImage`)}>
                    <Button variant="outline" className="w-full justify-start font-mono text-sm border-border/60 bg-background/50 hover:bg-secondary rounded-none">
                      <Download size={16} className="mr-3 text-primary" />
                      .AppImage — Universal Linux
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop app note */}
          <div className="border border-border/40 bg-black/20 p-4 font-mono text-xs text-muted-foreground flex items-start gap-3">
            <span className="text-primary mt-0.5">ℹ</span>
            <span>
              The desktop app requires the <strong className="text-foreground">lokadev CLI binary</strong> to be installed for project management.
              Install the CLI first, then install the desktop app on top of it.
            </span>
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
            <h3 className="font-semibold text-foreground mb-2 font-mono text-sm">System Requirements</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground font-mono">
              <div><span className="text-foreground">Windows:</span> Windows 10 build 1903+ or Windows 11, 64-bit</div>
              <div><span className="text-foreground">Linux:</span> Kernel 5.x+, x86_64 or arm64</div>
              <div><span className="text-foreground">RAM:</span> 4 GB minimum (8 GB recommended)</div>
              <div><span className="text-foreground">Disk:</span> 2 GB free space</div>
              <div><span className="text-foreground">Desktop app (Linux):</span> WebKitGTK + libayatana-appindicator</div>
              <div><span className="text-foreground">Desktop app (Windows):</span> WebView2 (auto-installed)</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
