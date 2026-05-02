<div align="center">

<img src="https://lokadev.app/lokadev.svg" width="64" alt="LokaDev logo" />

# LokaDev

**The next-generation local development environment for Windows & Linux.**

Think Laragon, but built for the modern era — project isolation, multiple runtimes, zero config, native desktop GUI, and a full CLI.

[![Release](https://img.shields.io/github/v/release/ptraxzy/lokadev?style=flat-square&color=06b6d4)](https://github.com/ptraxzy/lokadev/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Go](https://img.shields.io/badge/go-1.22-00ADD8?style=flat-square&logo=go)](https://go.dev)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey?style=flat-square)](#installation)

[Website](https://lokadev.app) · [Download](https://lokadev.app/download) · [Docs](https://lokadev.app/docs) · [Demo](https://lokadev.app/app)

</div>

---

## What is LokaDev?

LokaDev is a local development environment that lets you run multiple isolated projects simultaneously — each with its own web server, database, and runtime version — without the overhead of Docker or virtual machines.

```bash
# Create a PHP 8.3 project with MySQL in seconds
lokadev create saas-app --runtime=php:8.3 --server=nginx --db=mysql

# Start it
lokadev start saas-app

# Open the dashboard
lokadev open saas-app   # → https://saas-app.test (local SSL)
```

## Features

| Feature | Description |
|---|---|
| **Project Isolation** | Each project runs in its own environment — no port conflicts, no dependency pollution |
| **Polyglot Runtimes** | PHP 7.4–8.3, Node.js 18–22, Python 3.10–3.12, Go 1.21+ — per project |
| **Built-in Databases** | MySQL 8, PostgreSQL 16, Redis, SQLite — isolated per project |
| **Web Servers** | Nginx, Apache, Caddy — choose per project |
| **Desktop GUI** | Native desktop app (Windows .msi, Linux .AppImage/.deb) with system tray |
| **Web Dashboard** | Beautiful dashboard at `http://localhost:25000` |
| **Full CLI** | `create` · `start` · `stop` · `list` · `logs` · `shell` · `db` · `open` |
| **Zero Config** | Automatic local SSL, DNS resolution, port routing |
| **Cross-Platform** | First-class support for Windows 10/11 and Linux (Fedora, Debian, Ubuntu, RHEL) |

## Installation

### Quick Install (Linux)

```bash
curl -sSL https://raw.githubusercontent.com/ptraxzy/lokadev/main/install.sh | bash
```

### Fedora / RHEL

```bash
# From .rpm release
sudo dnf install ./lokadev-1.0.4.x86_64.rpm
```

### Debian / Ubuntu

```bash
sudo dpkg -i lokadev_1.0.4_amd64.deb
sudo apt-get install -f
```

### Windows

Download `lokadev.exe` from the [latest release](https://github.com/ptraxzy/lokadev/releases/latest) and add to PATH.

### Desktop App (GUI)

Download the native desktop application from [lokadev.app/download](https://lokadev.app/download):

| Platform | Format | File |
|---|---|---|
| Windows 10/11 | Installer | `LokaDev_1.0.4_x64_en-US.msi` |
| Linux x86_64 | AppImage | `LokaDev-Desktop_1.0.4_amd64.AppImage` |
| Linux x86_64 | Debian pkg | `lokadev-desktop_1.0.4_amd64.deb` |

The desktop app starts the LokaDev daemon automatically, shows a system tray icon, and gives you a full GUI dashboard without needing the CLI.

## CLI Reference

```
lokadev create <name>     Create a new project
lokadev start <name>      Start a project's services
lokadev stop <name>       Stop a project
lokadev restart <name>    Restart a project
lokadev list              List all projects with status
lokadev open <name>       Open project in browser
lokadev logs <name>       Tail project logs
lokadev shell <name>      Shell into project directory
lokadev db add <name>     Add a database to a project
lokadev daemon            Start background daemon (API + dashboard)
lokadev version           Print version info
```

**Create flags:**

```
--runtime=<lang:version>   Runtime (php:8.3, node:20, python:3.12, go:1.22)
--server=<name>            Web server (nginx, apache, caddy)
--db=<name>                Database (mysql, postgres, redis, sqlite, none)
--domain=<host>            Custom local domain (default: <name>.test)
```

## Project Structure

```
lokadev/
├── lokadev-app/               Go CLI + daemon
│   ├── main.go
│   ├── cmd/lokadev/
│   │   ├── root.go            Root command
│   │   ├── create.go          lokadev create
│   │   ├── project_cmds.go    start/stop/restart/delete/list/logs/shell
│   │   ├── db.go              lokadev db
│   │   ├── service.go         lokadev service
│   │   └── platform_helpers.go  OS helpers + HTTP daemon
│   └── internal/registry/     Project persistence (~/.config/lokadev/)
│
├── lokadev-desktop/           Native desktop app (Tauri + React)
│   ├── src/                   React dashboard UI
│   └── src-tauri/             Rust backend (system tray, window management)
│
├── artifacts/lokadev/         Marketing website (React + Vite)
│   └── src/pages/             home, docs, download, app demo, privacy
│
└── .github/workflows/         CI/CD
    ├── release.yml            Builds CLI + desktop app on tag push
    └── ci.yml                 Build check on every PR
```

## Building from Source

### CLI (Go)

```bash
cd lokadev-app

# Build for current platform
go build -o lokadev .

# Cross-compile for Windows
GOOS=windows GOARCH=amd64 go build -o lokadev.exe .

# Cross-compile for Linux arm64
GOOS=linux GOARCH=arm64 go build -o lokadev-linux-arm64 .

# All platforms via Makefile
make all
```

### Desktop App (Tauri)

```bash
cd lokadev-desktop

# Install system dependencies (Fedora)
sudo dnf install -y gcc webkit2gtk4.0-devel openssl-devel \
  libayatana-appindicator-gtk3-devel librsvg2-devel

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build
npm install
npm run tauri build
# → src-tauri/target/release/bundle/{deb,rpm,appimage}/
```

## Releases

Releases are published automatically on GitHub Actions when a version tag is pushed:

```bash
git tag v1.0.5
git push origin v1.0.5
```

This triggers builds for:
- `lokadev.exe` — Windows CLI
- `lokadev-linux-amd64` — Linux CLI (x86_64)
- `lokadev-linux-arm64` — Linux CLI (arm64)
- `lokadev_*.deb` — Debian/Ubuntu package
- `lokadev-*.rpm` — Fedora/RHEL package
- `LokaDev-CLI-*.AppImage` — Universal Linux CLI
- `LokaDev_*_x64_en-US.msi` — Windows desktop installer
- `LokaDev-Desktop_*.AppImage` — Linux desktop app

## Contributing

Contributions are welcome! This project is maintained by [@ptraxzy](https://github.com/ptraxzy).

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

Please open an [issue](https://github.com/ptraxzy/lokadev/issues) before working on large changes.

## License

[MIT](LICENSE) — free and open source forever.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/ptraxzy">@ptraxzy</a>
</div>
