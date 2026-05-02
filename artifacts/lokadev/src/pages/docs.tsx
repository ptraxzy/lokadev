import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Terminal, Download, Database, Server, Package,
  ChevronRight, Copy, Check, Menu, X, AppWindow,
} from "lucide-react";

const GITHUB   = "https://github.com/ptraxzy/lokadev";
const RELEASES = `${GITHUB}/releases`;

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg border border-border/50 bg-[#0d1117] overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-secondary/20">
        <span className="text-xs font-mono text-muted-foreground">{lang}</span>
        <button
          onClick={handleCopy}
          className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="absolute -top-20" />;
}

const navSections = [
  {
    title: "Getting Started",
    items: [
      { href: "#introduction",   label: "Introduction" },
      { href: "#installation",   label: "Installation" },
      { href: "#quickstart",     label: "Quickstart" },
    ],
  },
  {
    title: "Installation",
    items: [
      { href: "#install-windows",  label: "Windows" },
      { href: "#install-fedora",   label: "Fedora Linux" },
      { href: "#install-debian",   label: "Debian / Ubuntu" },
      { href: "#install-desktop",  label: "Desktop App (GUI)" },
      { href: "#install-source",   label: "From Source" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { href: "#projects",    label: "Managing Projects" },
      { href: "#databases",   label: "Databases" },
      { href: "#services",    label: "Services & Runtimes" },
      { href: "#containers",  label: "Isolation" },
    ],
  },
  {
    title: "CLI Reference",
    items: [
      { href: "#cli",     label: "CLI Commands" },
      { href: "#config",  label: "Configuration File" },
    ],
  },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="pr-6 border-r border-border/30">
      {navSections.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary px-1 py-1 rounded transition-colors group"
                >
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function DocsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileSidebarOpen]);

  return (
    <MainLayout>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-background border-r border-border/40 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-sm font-bold">Contents</span>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X size={18} className="text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 sm:py-12 flex gap-0 md:gap-12 min-h-screen max-w-6xl">
        <aside className="md:w-56 shrink-0 hidden md:block">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </aside>

        <div className="flex-1 max-w-3xl pb-32 relative min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border/40 rounded px-3 py-2 mb-8 hover:text-foreground hover:border-border transition-colors"
          >
            <Menu size={14} /> Browse contents
          </button>

          {/* Introduction */}
          <section className="mb-14 relative">
            <SectionAnchor id="introduction" />
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Docs</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Documentation</h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              LokaDev is a next-generation local development environment for Windows and Linux. Run
              multiple isolated projects simultaneously — each with their own web server, database, and runtime
              version — without the overhead of Docker. Available as a CLI tool and a native desktop app.
            </p>
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Installation overview */}
          <section className="mb-14 relative">
            <SectionAnchor id="installation" />
            <div className="flex items-center gap-2 mb-2">
              <Download size={18} className="text-primary" />
              <h2 className="text-2xl font-bold">Installation</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              LokaDev supports Windows 10/11 and Linux (Fedora, Debian, Ubuntu, RHEL). Available as a CLI and a native desktop GUI.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: "Windows",         href: "#install-windows",  desc: ".exe / CLI" },
                { label: "Fedora",          href: "#install-fedora",   desc: ".rpm / dnf" },
                { label: "Debian / Ubuntu", href: "#install-debian",   desc: ".deb / apt" },
                { label: "Desktop App",     href: "#install-desktop",  desc: "GUI (Tauri)" },
                { label: "From Source",     href: "#install-source",   desc: "Go + Rust" },
              ].map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  className="border border-border/40 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40 rounded-lg p-4 transition-colors group"
                >
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{p.label}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{p.desc}</p>
                </a>
              ))}
            </div>
            <div className="border border-border/30 bg-secondary/10 rounded-lg p-4 text-sm text-muted-foreground">
              All pre-built binaries are available on{" "}
              <a href={RELEASES} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono">
                GitHub Releases
              </a>
              . Download the file for your platform and follow the steps below.
            </div>
          </section>

          {/* Windows */}
          <section className="mb-14 relative">
            <SectionAnchor id="install-windows" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🪟</span> Windows Installation
            </h3>
            <p className="text-muted-foreground mb-4">
              Download <code className="text-primary bg-secondary/50 px-1 rounded text-sm">lokadev.exe</code> from{" "}
              <a href={RELEASES} target="_blank" rel="noreferrer" className="text-primary hover:underline">GitHub Releases</a> and add it to your PATH,
              or use the Desktop App installer for a full GUI experience.
            </p>
            <ol className="space-y-4 text-muted-foreground list-none">
              {[
                <>Download <code className="text-foreground bg-secondary/50 px-1 rounded text-sm">lokadev.exe</code> from the <a href={RELEASES} target="_blank" rel="noreferrer" className="text-primary hover:underline">Releases page</a>.</>,
                <>Move it to a folder on your PATH (e.g. <code className="text-foreground bg-secondary/50 px-1 rounded text-sm">C:\lokadev\</code>) and optionally run as Administrator.</>,
                <>Open a terminal and run <code className="text-foreground bg-secondary/50 px-1 rounded text-sm">lokadev daemon</code> to start the background service.</>,
                <>The dashboard is available at <code className="text-foreground bg-secondary/50 px-1 rounded text-sm">http://localhost:25000</code>.</>,
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono flex items-center justify-center border border-primary/20">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 border border-border/30 bg-secondary/10 rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-foreground block mb-1">Winget (coming soon)</strong>
              <CodeBlock code="winget install LokaDev.LokaDev" />
            </div>
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Fedora */}
          <section className="mb-14 relative">
            <SectionAnchor id="install-fedora" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎩</span> Fedora Linux Installation
            </h3>
            <p className="text-muted-foreground mb-4">
              Download the <code className="text-primary bg-secondary/50 px-1 rounded text-sm">.rpm</code> from{" "}
              <a href={RELEASES} target="_blank" rel="noreferrer" className="text-primary hover:underline">GitHub Releases</a> and install with{" "}
              <code className="text-primary bg-secondary/50 px-1 rounded text-sm">dnf</code>.
            </p>

            <h4 className="font-semibold text-foreground mb-2">Option A — RPM Package</h4>
            <CodeBlock code={`# 1. Download the RPM from GitHub Releases:
#    https://github.com/ptraxzy/lokadev/releases
#    File: lokadev-1.0.4.x86_64.rpm

# 2. Install with dnf
sudo dnf install ./lokadev-1.0.4.x86_64.rpm

# 3. Verify
lokadev --help`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">Option B — Install Script</h4>
            <CodeBlock code={`curl -sSL https://raw.githubusercontent.com/ptraxzy/lokadev/main/install.sh | bash`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">Enable system services</h4>
            <CodeBlock code={`sudo dnf install -y nginx mariadb-server postgresql-server
sudo systemctl enable --now mariadb`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">User Namespaces (Fedora 40+)</h4>
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-yellow-400 block mb-2">Required for container isolation</strong>
              <CodeBlock code={`echo "user.max_user_namespaces=15000" | sudo tee /etc/sysctl.d/99-lokadev.conf
sudo sysctl --system`} />
            </div>
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Debian/Ubuntu */}
          <section className="mb-14 relative">
            <SectionAnchor id="install-debian" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🐧</span> Debian / Ubuntu Installation
            </h3>
            <p className="text-muted-foreground mb-4">
              Download the <code className="text-primary bg-secondary/50 px-1 rounded text-sm">.deb</code> from{" "}
              <a href={RELEASES} target="_blank" rel="noreferrer" className="text-primary hover:underline">GitHub Releases</a> and install with{" "}
              <code className="text-primary bg-secondary/50 px-1 rounded text-sm">dpkg</code>.
            </p>
            <CodeBlock code={`# 1. Download from GitHub Releases:
#    https://github.com/ptraxzy/lokadev/releases
#    File: lokadev_1.0.4_amd64.deb

# 2. Install
sudo dpkg -i lokadev_1.0.4_amd64.deb
sudo apt-get install -f   # resolve any missing deps

# 3. Verify
lokadev --help`} />
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Desktop App */}
          <section className="mb-14 relative">
            <SectionAnchor id="install-desktop" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AppWindow size={20} className="text-primary" /> Desktop App (GUI)
            </h3>
            <p className="text-muted-foreground mb-4">
              The native desktop app provides a full dashboard, system tray icon, and one-click project management — without touching the terminal.
              Built with <strong className="text-foreground">Tauri v2</strong> (Rust + React).
            </p>
            <div className="border border-border/30 bg-secondary/10 rounded-lg p-4 text-sm text-muted-foreground mb-4">
              <strong className="text-foreground block mb-1">Prerequisite</strong>
              Install the <strong className="text-foreground">LokaDev CLI</strong> for your platform first (see above). The desktop app calls the{" "}
              <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">lokadev</code> binary.
            </div>

            <h4 className="font-semibold text-foreground mb-2">Windows</h4>
            <CodeBlock code={`# 1. Download from GitHub Releases:
#    https://github.com/ptraxzy/lokadev/releases
#    File: LokaDev_1.0.4_x64_en-US.msi

# 2. Run the installer
# WebView2 is installed automatically if missing`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">Fedora 41+ / Fedora 43</h4>
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4 text-sm text-muted-foreground mb-4">
              <strong className="text-yellow-400 block mb-2">Fedora 41+ Note</strong>
              Fedora 41+ removed <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">webkit2gtk4.0-devel</code>.
              The desktop app uses <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">webkitgtk6.0</code> (Tauri v2).
              Install the required runtime:
            </div>
            <CodeBlock code={`sudo dnf install -y webkitgtk6.0 libayatana-appindicator-gtk3

# Download from GitHub Releases:
# File: lokadev-desktop_1.0.4_amd64.deb  OR
#       LokaDev-Desktop_1.0.4_amd64.AppImage`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">Debian / Ubuntu</h4>
            <CodeBlock code={`sudo apt-get install -y libwebkit2gtk-4.1-0 libayatana-appindicator3-1

# Install the .deb
sudo dpkg -i lokadev-desktop_1.0.4_amd64.deb`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">AppImage (any Linux)</h4>
            <CodeBlock code={`# Download LokaDev-Desktop_1.0.4_amd64.AppImage from GitHub Releases
chmod +x LokaDev-Desktop_1.0.4_amd64.AppImage
./LokaDev-Desktop_1.0.4_amd64.AppImage`} />
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* From Source */}
          <section className="mb-14 relative">
            <SectionAnchor id="install-source" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⚙️</span> Build from Source
            </h3>
            <p className="text-muted-foreground mb-4">
              Requires <strong className="text-foreground">Go 1.22+</strong> for the CLI,{" "}
              <strong className="text-foreground">Rust 1.77+ + Node.js 20+</strong> for the desktop app.
            </p>

            <h4 className="font-semibold text-foreground mb-2">CLI (Go)</h4>
            <CodeBlock code={`git clone https://github.com/ptraxzy/lokadev.git
cd lokadev/lokadev-app
go mod download
go build -o lokadev .
sudo mv lokadev /usr/local/bin/
lokadev --help`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">Desktop App (Tauri v2 — Fedora 41+)</h4>
            <CodeBlock code={`# System dependencies
sudo dnf install -y gcc openssl-devel librsvg2-devel \\
  webkitgtk6.0-devel libayatana-appindicator-gtk3-devel

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Build — must be in lokadev-desktop/, NOT lokadev-app/
cd ~/lokadev/lokadev-desktop
npm install
npm run generate-icons   # generates src-tauri/icons/ from SVG
npm run tauri build`} />
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Quickstart */}
          <section className="mb-14 relative">
            <SectionAnchor id="quickstart" />
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={18} className="text-primary" />
              <h2 className="text-2xl font-bold">Quickstart</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Once installed, use the CLI to create and manage your first project:
            </p>
            <CodeBlock code={`# Create a new project (PHP + Nginx + MySQL)
lokadev create my-app --runtime=php:8.3 --server=nginx --db=mysql

# List all projects and their status
lokadev list

# Start the project's services
lokadev start my-app

# Open the project in your browser
lokadev open my-app`} />
            <p className="text-muted-foreground text-sm mt-4">
              Your project is available at{" "}
              <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">https://my-app.test</code>.
              The web dashboard runs at{" "}
              <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">http://localhost:25000</code>.
            </p>
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Projects */}
          <section className="mb-14 relative">
            <SectionAnchor id="projects" />
            <div className="flex items-center gap-2 mb-2">
              <Package size={18} className="text-primary" />
              <h2 className="text-2xl font-bold">Managing Projects</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Each LokaDev project is a self-contained unit with its own web server, database, and runtime.
              Run multiple projects simultaneously with no port conflicts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {[
                { cmd: "lokadev create <name>",   desc: "Create a new project" },
                { cmd: "lokadev start <name>",    desc: "Start a project's services" },
                { cmd: "lokadev stop <name>",     desc: "Stop a project" },
                { cmd: "lokadev restart <name>",  desc: "Restart project services" },
                { cmd: "lokadev delete <name>",   desc: "Delete project and all data" },
                { cmd: "lokadev list",            desc: "List all projects and status" },
                { cmd: "lokadev open <name>",     desc: "Open project in browser" },
                { cmd: "lokadev logs <name>",     desc: "Tail project logs" },
                { cmd: "lokadev shell <name>",    desc: "Open shell in project dir" },
                { cmd: "lokadev config <name>",   desc: "Edit lokadev.toml" },
              ].map((item) => (
                <div key={item.cmd} className="border border-border/40 bg-secondary/10 rounded-lg p-3">
                  <code className="text-xs font-mono text-primary block mb-1">{item.cmd}</code>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Databases */}
          <section className="mb-14 relative">
            <SectionAnchor id="databases" />
            <div className="flex items-center gap-2 mb-2">
              <Database size={18} className="text-primary" />
              <h2 className="text-2xl font-bold">Databases</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              LokaDev supports MySQL/MariaDB, PostgreSQL, Redis, and SQLite. Each project gets its own isolated database instance.
            </p>
            <CodeBlock code={`# Add a database to an existing project
lokadev db add my-app --type=mysql

# Connect to the database shell
lokadev db shell my-app

# Backup and restore
lokadev db dump my-app > backup.sql
lokadev db restore my-app < backup.sql`} />
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Services */}
          <section className="mb-14 relative">
            <SectionAnchor id="services" />
            <div className="flex items-center gap-2 mb-2">
              <Server size={18} className="text-primary" />
              <h2 className="text-2xl font-bold">Services & Runtimes</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Multiple runtime versions, selectable per project — no global version manager needed.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono border-collapse">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 pr-8 text-muted-foreground font-medium">Runtime</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Available Versions</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground divide-y divide-border/20">
                  <tr><td className="py-2 pr-8 text-foreground">PHP</td><td>7.4, 8.0, 8.1, 8.2, 8.3</td></tr>
                  <tr><td className="py-2 pr-8 text-foreground">Node.js</td><td>18 (LTS), 20 (LTS), 22</td></tr>
                  <tr><td className="py-2 pr-8 text-foreground">Python</td><td>3.10, 3.11, 3.12</td></tr>
                  <tr><td className="py-2 pr-8 text-foreground">Go</td><td>1.21, 1.22</td></tr>
                  <tr><td className="py-2 pr-8 text-foreground">Web Server</td><td>Nginx, Apache, Caddy</td></tr>
                  <tr><td className="py-2 pr-8 text-foreground">Database</td><td>MySQL 8, MariaDB 10, PostgreSQL 16, Redis 7, SQLite</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Containers */}
          <section className="mb-14 relative">
            <SectionAnchor id="containers" />
            <h2 className="text-2xl font-bold mb-4">Isolation & Containers</h2>
            <p className="text-muted-foreground mb-4">
              LokaDev uses Linux user namespaces and Windows Job Objects to isolate each project — Docker-like isolation without Docker.
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm list-disc pl-5">
              <li>Each project gets its own network namespace — no port conflicts</li>
              <li>Process isolation prevents one project crashing from affecting others</li>
              <li>On Linux: rootless <code className="text-foreground bg-secondary/50 px-1 rounded">unshare</code> — no root required at runtime</li>
              <li>On Windows: Job Objects + WinSock namespacing provide equivalent isolation</li>
            </ul>
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* CLI Reference */}
          <section className="mb-14 relative">
            <SectionAnchor id="cli" />
            <h2 className="text-2xl font-bold mb-4">CLI Reference</h2>
            <p className="text-muted-foreground mb-4">Full command list. All actions available from the terminal.</p>
            <CodeBlock lang="text" code={`lokadev [command] [flags]

Commands:
  create    Create a new project
  start     Start project services
  stop      Stop project services
  restart   Restart services
  delete    Remove a project and its data
  list      List all projects and their status
  open      Open project in browser
  logs      Stream project logs
  shell     Open a shell inside the project directory
  db        Manage databases (add, shell, dump, restore)
  service   Start/stop individual services (nginx, mysql…)
  config    Edit lokadev.toml configuration
  update    Update LokaDev to the latest version
  version   Print version information
  daemon    Start the background daemon (dashboard on :25000)

Create flags:
  --runtime=<lang:ver>   php:8.3 · node:20 · python:3.12 · go:1.22
  --server=<name>        nginx · apache · caddy
  --db=<name>            mysql · postgres · redis · sqlite · none
  --domain=<host>        Custom local domain (default: <name>.test)

Global flags:
  --help, -h     Show help
  --project, -p  Project name shorthand`} />
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Config */}
          <section className="mb-14 relative">
            <SectionAnchor id="config" />
            <h2 className="text-2xl font-bold mb-4">Configuration File</h2>
            <p className="text-muted-foreground mb-4">
              Each project has a <code className="text-primary bg-secondary/50 px-1 rounded text-sm">lokadev.toml</code> in its root directory.
              Edit with <code className="text-foreground bg-secondary/50 px-1 rounded text-sm">lokadev config &lt;name&gt;</code> or directly.
            </p>
            <CodeBlock lang="toml" code={`[project]
name   = "my-app"
domain = "my-app.test"

[runtime]
php  = "8.3"
node = "20"

[server]
type = "nginx"
port = 80
ssl  = true

[database]
type    = "mysql"
version = "8"
name    = "my_app_db"

[environment]
APP_ENV   = "local"
APP_DEBUG = "true"`} />

            <div className="mt-6 border border-border/30 bg-secondary/10 rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-foreground block mb-1">Need help?</strong>
              <a href={`${GITHUB}/issues`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Open an issue on GitHub
              </a>{" "}
              or check the{" "}
              <a href={`${GITHUB}/discussions`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                GitHub Discussions
              </a>.
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
