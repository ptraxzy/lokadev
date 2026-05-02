import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Download, Monitor, TerminalSquare, AlertCircle, Github,
  ExternalLink, AppWindow, Copy, Check, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB   = "https://github.com/ptraxzy/lokadev";
const RELEASES = `${GITHUB}/releases`;
const VERSION  = "1.0.4";

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3 bg-black/60 border border-border/40 px-4 py-3 font-mono text-sm">
      <span className="text-primary select-none shrink-0">$</span>
      <code className="flex-1 text-foreground text-xs sm:text-sm break-all">{code}</code>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function ReleaseBadge({ filename }: { filename: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-secondary/30 border border-border/30 px-3 py-1.5 rounded-none mt-2">
      <span className="text-muted-foreground/50">file:</span>
      <span className="text-foreground/70 break-all">{filename}</span>
    </div>
  );
}

function DownloadBtn({
  href,
  label,
  filename,
  variant = "outline",
}: {
  href: string;
  label: string;
  filename: string;
  variant?: "primary" | "outline";
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      <Button
        variant={variant === "primary" ? "default" : "outline"}
        className={`w-full justify-start font-mono text-sm rounded-none gap-2 ${variant === "primary" ? "h-12 bg-primary hover:bg-primary/90" : "border-border/60 bg-background/50 hover:bg-secondary"}`}
        size={variant === "primary" ? "lg" : "default"}
      >
        <Download size={variant === "primary" ? 18 : 16} className={variant !== "primary" ? "text-primary" : ""} />
        {label}
      </Button>
      <ReleaseBadge filename={filename} />
    </a>
  );
}

export default function DownloadPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-none mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            v{VERSION} — Latest Stable Release
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Download LokaDev</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono">
            Free and open-source forever. No license key, no telemetry.
          </p>
        </div>

        {/* Releases banner */}
        <div className="flex items-center justify-between gap-4 border border-border/40 bg-secondary/20 px-5 py-4 rounded-none mb-10">
          <div className="flex items-center gap-3 min-w-0">
            <Github size={18} className="text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-mono font-semibold">All binaries are on GitHub Releases</p>
              <p className="text-xs text-muted-foreground font-mono">Find every platform build at <span className="text-primary">{GITHUB.replace("https://", "")}/releases</span></p>
            </div>
          </div>
          <a href={RELEASES} target="_blank" rel="noreferrer" className="shrink-0">
            <Button variant="outline" className="font-mono text-xs gap-1.5 rounded-none whitespace-nowrap">
              View Releases <ExternalLink size={11} />
            </Button>
          </a>
        </div>

        {/* ── CLI SECTION ── */}
        <section className="mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TerminalSquare size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-lg">CLI — Command Line Interface</h2>
              <p className="text-xs text-muted-foreground font-mono">Lightweight binary. Manages projects, services, and databases from the terminal.</p>
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
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Single binary, no installer</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Add to PATH, use anywhere</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Dashboard at localhost:25000</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> MySQL, PostgreSQL, Redis</li>
                </ul>
              </div>
              <DownloadBtn
                href={`${RELEASES}/latest/download/lokadev.exe`}
                label="Download lokadev.exe"
                filename={`lokadev.exe`}
                variant="primary"
              />
              <p className="text-xs text-muted-foreground font-mono text-center mt-3 opacity-60">
                Add to PATH → run as Administrator
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
                <p className="text-sm text-muted-foreground font-mono mb-4">Choose your format:</p>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/lokadev_${VERSION}_amd64.deb`}
                    label=".deb — Debian / Ubuntu / Mint"
                    filename={`lokadev_${VERSION}_amd64.deb`}
                  />
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/lokadev-${VERSION}.x86_64.rpm`}
                    label=".rpm — Fedora / RHEL / openSUSE"
                    filename={`lokadev-${VERSION}.x86_64.rpm`}
                  />
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/LokaDev-CLI-${VERSION}-x86_64.AppImage`}
                    label=".AppImage — Universal Linux"
                    filename={`LokaDev-CLI-${VERSION}-x86_64.AppImage`}
                  />
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/lokadev-linux-arm64`}
                    label="Binary — Linux arm64"
                    filename={`lokadev-linux-arm64`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick install */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-2">Quick install — Linux (one-liner)</p>
            <CopyBlock code="curl -sSL https://raw.githubusercontent.com/ptraxzy/lokadev/main/install.sh | bash" />
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border/40 my-10" />

        {/* ── DESKTOP APP SECTION ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
              <AppWindow size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-lg">Desktop App — Native GUI</h2>
              <p className="text-xs text-muted-foreground font-mono">
                Full windowed app. System tray, project dashboard, one-click start/stop. Built with Tauri v2.
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
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Native app — no browser needed</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> System tray with quick actions</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Auto-starts daemon on launch</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> One-click start/stop projects</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Minimizes to tray — always on</li>
                </ul>
                <div className="flex flex-col gap-3">
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/LokaDev_${VERSION}_x64_en-US.msi`}
                    label="Download .msi Installer"
                    filename={`LokaDev_${VERSION}_x64_en-US.msi`}
                    variant="primary"
                  />
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/LokaDev_${VERSION}_x64-setup.exe`}
                    label="Download .exe (NSIS Installer)"
                    filename={`LokaDev_${VERSION}_x64-setup.exe`}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono text-center mt-3 opacity-60">
                WebView2 is auto-installed if missing
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
                <ul className="space-y-2 mb-5 text-sm text-muted-foreground font-mono">
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Native GTK + WebKitGTK window</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> System tray via libayatana</li>
                  <li className="flex items-center gap-2"><span className="text-primary">✓</span> Fedora, Ubuntu, Debian, Arch</li>
                </ul>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/lokadev-desktop_${VERSION}_amd64.deb`}
                    label=".deb — Debian / Ubuntu"
                    filename={`lokadev-desktop_${VERSION}_amd64.deb`}
                  />
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/LokaDev-Desktop_${VERSION}_amd64.AppImage`}
                    label=".AppImage — Universal Linux"
                    filename={`LokaDev-Desktop_${VERSION}_amd64.AppImage`}
                  />
                  <DownloadBtn
                    href={`${RELEASES}/latest/download/lokadev-desktop-${VERSION}.x86_64.rpm`}
                    label=".rpm — Fedora / RHEL"
                    filename={`lokadev-desktop-${VERSION}.x86_64.rpm`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop note */}
          <div className="border border-border/40 bg-black/20 p-4 font-mono text-xs text-muted-foreground flex items-start gap-3 mb-3">
            <span className="text-primary mt-0.5 shrink-0">ℹ</span>
            <span>
              The desktop app requires the <strong className="text-foreground">LokaDev CLI</strong> to be installed first.
              Install the CLI for your platform above, then install the desktop app on top.
            </span>
          </div>
        </section>

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

        {/* Build from source */}
        <div className="border border-border/40 bg-secondary/10 p-6 mb-6">
          <h3 className="font-mono font-semibold text-sm mb-3 flex items-center gap-2">
            <Github size={14} className="text-muted-foreground" />
            Build from Source
          </h3>
          <div className="space-y-2">
            <CopyBlock code="git clone https://github.com/ptraxzy/lokadev.git && cd lokadev/lokadev-app && go build -o lokadev ." />
            <p className="text-xs text-muted-foreground font-mono">
              Requires <span className="text-foreground">Go 1.22+</span>. See{" "}
              <a href={`${GITHUB}#building-from-source`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                README
              </a>{" "}
              for desktop app build instructions.
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div className="border border-border/40 bg-secondary/20 p-6 flex items-start gap-4">
          <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="font-semibold text-foreground mb-2 font-mono text-sm">System Requirements</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground font-mono">
              <div><span className="text-foreground">Windows:</span> 10 build 1903+ or 11, 64-bit</div>
              <div><span className="text-foreground">Linux:</span> Kernel 5.x+, x86_64 or arm64</div>
              <div><span className="text-foreground">RAM:</span> 4 GB minimum (8 GB recommended)</div>
              <div><span className="text-foreground">Disk:</span> 2 GB free space</div>
              <div><span className="text-foreground">Desktop (Linux):</span> WebKitGTK + libayatana</div>
              <div><span className="text-foreground">Desktop (Windows):</span> WebView2 (auto-installed)</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
