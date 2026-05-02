import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Terminal, Download, Database, Server, Package, ChevronRight, Copy, Check } from "lucide-react";

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
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
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
      { href: "#introduction", label: "Introduction" },
      { href: "#installation", label: "Installation" },
      { href: "#quickstart", label: "Quickstart" },
    ],
  },
  {
    title: "Installation Guides",
    items: [
      { href: "#install-windows", label: "Windows" },
      { href: "#install-fedora", label: "Fedora Linux" },
      { href: "#install-debian", label: "Debian / Ubuntu" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { href: "#projects", label: "Managing Projects" },
      { href: "#databases", label: "Databases" },
      { href: "#services", label: "Services & Runtimes" },
      { href: "#containers", label: "Isolation & Containers" },
    ],
  },
  {
    title: "CLI Reference",
    items: [
      { href: "#cli", label: "CLI Commands" },
      { href: "#config", label: "Configuration File" },
    ],
  },
];

export default function DocsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-0 md:gap-12 min-h-screen">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0 hidden md:block">
          <div className="sticky top-24 pr-6 border-r border-border/30">
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
        </aside>

        {/* Main content */}
        <div className="flex-1 max-w-3xl pb-32 relative">

          {/* Introduction */}
          <section className="mb-14 relative">
            <SectionAnchor id="introduction" />
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Docs</p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              LokaDev is a next-generation local development environment for Windows and Linux. It lets you run
              multiple isolated projects simultaneously — each with their own web server, database, and runtime
              versions — without the overhead of Docker.
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
              LokaDev supports Windows 10/11 and Linux (Fedora, Debian, Ubuntu, RHEL). Choose your platform below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: "Windows", href: "#install-windows", desc: ".exe installer" },
                { label: "Fedora", href: "#install-fedora", desc: ".rpm / dnf" },
                { label: "Debian/Ubuntu", href: "#install-debian", desc: ".deb / apt" },
              ].map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  className="border border-border/40 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40 rounded-lg p-4 transition-colors group"
                >
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.label}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{p.desc}</p>
                </a>
              ))}
            </div>
          </section>

          {/* Windows */}
          <section className="mb-14 relative">
            <SectionAnchor id="install-windows" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🪟</span> Windows Installation
            </h3>
            <p className="text-muted-foreground mb-4">
              LokaDev for Windows ships as a standard <code className="text-primary bg-secondary/50 px-1 rounded text-sm">.exe</code> installer.
              Run it as Administrator for full feature support (hosts file management, service registration).
            </p>
            <ol className="space-y-4 text-muted-foreground list-none">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono flex items-center justify-center border border-primary/20">1</span>
                <span>Download <code className="text-foreground bg-secondary/50 px-1 rounded text-sm">LokaDev-Setup-1.0.4-x64.exe</code> from the <a href="/download" className="text-primary hover:underline">Download page</a>.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono flex items-center justify-center border border-primary/20">2</span>
                <span>Right-click the installer and select <strong className="text-foreground">Run as administrator</strong>. Accept the UAC prompt.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono flex items-center justify-center border border-primary/20">3</span>
                <span>Follow the setup wizard. LokaDev installs to <code className="text-foreground bg-secondary/50 px-1 rounded text-sm">C:\lokadev\</code> by default.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono flex items-center justify-center border border-primary/20">4</span>
                <span>Launch LokaDev from the Start Menu or system tray icon. The dashboard opens at <code className="text-foreground bg-secondary/50 px-1 rounded text-sm">http://localhost:25000</code>.</span>
              </li>
            </ol>

            <div className="mt-6 border border-border/30 bg-secondary/10 rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-foreground block mb-1">Winget (alternative)</strong>
              Install LokaDev directly via Windows Package Manager:
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
              LokaDev ships as an <code className="text-primary bg-secondary/50 px-1 rounded text-sm">.rpm</code> package for Fedora and RHEL-based distributions,
              and is also available via the LokaDev COPR repository for automatic updates.
            </p>

            <h4 className="font-semibold text-foreground mb-2">Option A — COPR (recommended)</h4>
            <p className="text-muted-foreground text-sm mb-2">
              The COPR repo keeps LokaDev up-to-date automatically via <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">dnf</code>.
            </p>
            <CodeBlock code={`# Enable the LokaDev COPR repository
sudo dnf copr enable lokadev/lokadev

# Install LokaDev
sudo dnf install lokadev

# Enable and start the service
sudo systemctl enable --now lokadev`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">Option B — RPM Package</h4>
            <p className="text-muted-foreground text-sm mb-2">
              Download the <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">.rpm</code> and install it manually.
            </p>
            <CodeBlock code={`# Download
wget https://github.com/lokadev/lokadev/releases/latest/download/lokadev-1.0.4.x86_64.rpm

# Install with dnf (resolves dependencies automatically)
sudo dnf install ./lokadev-1.0.4.x86_64.rpm

# Start the daemon
sudo systemctl start lokadev`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">Post-install: Fedora SELinux</h4>
            <p className="text-muted-foreground text-sm mb-2">
              If you are running SELinux in enforcing mode (default on Fedora), apply the included policy module:
            </p>
            <CodeBlock code={`# Load the SELinux policy (included in the package)
sudo semodule -i /usr/share/lokadev/selinux/lokadev.pp

# Verify policy is active
sudo semodule -l | grep lokadev`} />

            <h4 className="font-semibold text-foreground mt-6 mb-2">Firewalld (optional)</h4>
            <p className="text-muted-foreground text-sm mb-2">
              To access the dashboard from other devices on your local network:
            </p>
            <CodeBlock code={`# Allow LokaDev dashboard port
sudo firewall-cmd --permanent --add-port=25000/tcp
sudo firewall-cmd --reload`} />

            <div className="mt-6 border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-yellow-400 block mb-1">Fedora 40+ Note</strong>
              LokaDev uses rootless namespaces for container isolation. Ensure <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">user.max_user_namespaces</code> is set:
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
            <CodeBlock code={`# Download the .deb package
wget https://github.com/lokadev/lokadev/releases/latest/download/lokadev_1.0.4_amd64.deb

# Install
sudo dpkg -i lokadev_1.0.4_amd64.deb
sudo apt-get install -f   # fix any missing dependencies

# Enable and start
sudo systemctl enable --now lokadev`} />
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
              Once LokaDev is running, open the dashboard at{" "}
              <code className="text-primary bg-secondary/50 px-1 rounded text-sm">http://localhost:25000</code>{" "}
              in your browser, or use the CLI:
            </p>
            <CodeBlock code={`# Create a new project (PHP + Nginx + PostgreSQL)
lokadev create my-app --runtime=php:8.3 --server=nginx --db=postgres

# Or interactively
lokadev create

# List all running projects
lokadev list

# Open the project in your default browser
lokadev open my-app`} />
            <p className="text-muted-foreground text-sm mt-4">
              Your project is automatically available at{" "}
              <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">https://my-app.test</code>{" "}
              with a local SSL certificate provisioned automatically.
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
              Each LokaDev project is a self-contained unit with its own network namespace, web server, database,
              and runtime configuration. You can run as many as your machine can handle simultaneously.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {[
                { cmd: "lokadev create <name>", desc: "Create a new project" },
                { cmd: "lokadev start <name>", desc: "Start a project's services" },
                { cmd: "lokadev stop <name>", desc: "Stop a project" },
                { cmd: "lokadev delete <name>", desc: "Delete project and data" },
                { cmd: "lokadev info <name>", desc: "Show project details" },
                { cmd: "lokadev logs <name>", desc: "Tail project logs" },
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
              LokaDev includes MySQL 8, PostgreSQL 16, Redis, and SQLite out of the box. Each project can have
              its own isolated database instance, or share one across projects.
            </p>
            <CodeBlock code={`# Add a database to an existing project
lokadev db add my-app --type=mysql

# Connect to the database shell
lokadev db shell my-app

# Dump and restore
lokadev db dump my-app > backup.sql
lokadev db restore my-app < backup.sql`} />
            <p className="text-muted-foreground text-sm mt-4">
              All databases are accessible via the built-in web UI (phpMyAdmin / pgAdmin equivalent) at
              {" "}<code className="text-foreground bg-secondary/50 px-1 rounded text-xs">http://localhost:25001</code>.
            </p>
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
              LokaDev supports multiple versions of each runtime, selectable per-project. No global
              version manager (nvm, phpenv, pyenv) needed.
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
              LokaDev uses Linux user namespaces (and Windows Job Objects on Windows) to isolate each project's
              network stack, file descriptors, and process tree. This gives you Docker-like isolation without
              requiring Docker to be installed.
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm list-disc pl-5">
              <li>Each project gets its own network namespace — no port conflicts between projects</li>
              <li>Process isolation prevents one project's crash from affecting others</li>
              <li>On Fedora/Linux, isolation uses rootless <code className="text-foreground bg-secondary/50 px-1 rounded">unshare</code> — no root required at runtime</li>
              <li>On Windows, Job Objects and WinSock namespacing provide equivalent isolation</li>
            </ul>
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* CLI Reference */}
          <section className="mb-14 relative">
            <SectionAnchor id="cli" />
            <h2 className="text-2xl font-bold mb-4">CLI Reference</h2>
            <p className="text-muted-foreground mb-4">
              LokaDev ships with a full CLI. All dashboard actions are also available from the terminal.
            </p>
            <CodeBlock code={`lokadev [command] [flags]

Commands:
  create    Create a new project
  start     Start project services
  stop      Stop project services
  restart   Restart services
  delete    Remove a project and its data
  list      List all projects and their status
  open      Open project in browser
  logs      Stream project logs
  shell     Open a shell inside the project namespace
  db        Manage project databases
  service   Start/stop individual services (nginx, mysql…)
  config    Edit lokadev.toml configuration
  update    Update LokaDev to the latest version
  version   Print version information

Flags:
  --help, -h     Show help
  --project, -p  Specify project name`} lang="text" />
          </section>

          <div className="h-px bg-border/30 mb-14" />

          {/* Config */}
          <section className="mb-14 relative">
            <SectionAnchor id="config" />
            <h2 className="text-2xl font-bold mb-4">Configuration File</h2>
            <p className="text-muted-foreground mb-4">
              Each project has a <code className="text-primary bg-secondary/50 px-1 rounded text-sm">lokadev.toml</code> file
              in its root directory.
            </p>
            <CodeBlock code={`[project]
name = "my-app"
domain = "my-app.test"

[runtime]
php = "8.3"
node = "20"

[server]
type = "nginx"
port = 80
ssl = true

[database]
type = "postgres"
version = "16"
name = "my_app_db"

[environment]
APP_ENV = "local"
APP_DEBUG = "true"`} lang="toml" />
          </section>

        </div>
      </div>
    </MainLayout>
  );
}
