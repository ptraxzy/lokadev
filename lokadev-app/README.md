# LokaDev

**The next-generation local development environment for Windows & Linux.**

Think Laragon, but supercharged — isolated projects, multiple runtimes per project, Docker-like containers without Docker, beautiful dashboard, and a full CLI.

## Features

- **Multi-project isolation** — each project runs in its own Linux namespace (or Windows Job Object), no port conflicts
- **Docker-like containers** — per-project isolated environments, no Dockerfile needed
- **Multiple runtime versions** — PHP 7.4–8.3, Node.js 18–22, Python 3.10–3.12, Go 1.21+ per project
- **Built-in databases** — MySQL 8, PostgreSQL 16, Redis, SQLite
- **Web servers** — Nginx, Apache, Caddy
- **Zero config** — works out of the box, local SSL via mkcert
- **Beautiful dashboard** — http://localhost:25000
- **Full CLI** — `lokadev create/start/stop/list/logs/shell/db/...`
- **Cross-platform** — Windows 10/11 and Linux (Fedora, Debian, Ubuntu, RHEL)

## Installation

### Fedora / RHEL (recommended: COPR)

```bash
sudo dnf copr enable lokadev/lokadev
sudo dnf install lokadev
sudo systemctl enable --now lokadev
```

### Fedora / RHEL (.rpm)

```bash
sudo dnf install ./lokadev-1.0.4.x86_64.rpm
sudo systemctl start lokadev
```

### Debian / Ubuntu

```bash
sudo dpkg -i lokadev_1.0.4_amd64.deb
sudo apt-get install -f
sudo systemctl enable --now lokadev
```

### Windows

Download `LokaDev-Setup-1.0.4-x64.exe` from [lokadev.app/download](https://lokadev.app/download) and run as Administrator.

## Quickstart

```bash
# Create a new PHP project
lokadev create my-laravel --runtime=php:8.3 --server=nginx --db=mysql

# Create a Node.js API
lokadev create my-api --runtime=node:20 --server=caddy --db=postgres

# List all projects
lokadev list

# Open in browser
lokadev open my-laravel
```

Your project is available at `https://my-laravel.test` with automatic SSL.

## Building from Source

### Requirements

- Go 1.22+
- `rpmbuild` (for `.rpm`), `dpkg-deb` (for `.deb`), `appimagetool` (for AppImage)
- Cross-compilation: install the standard Go toolchain (supports `GOOS=windows/linux`)

### Build

```bash
# Build for all platforms
make all

# Build for a specific platform
make windows        # → build/dist/windows/lokadev.exe
make linux-fedora   # → build/dist/fedora/RPMS/x86_64/lokadev-1.0.4.x86_64.rpm
make linux-debian   # → build/dist/debian/lokadev_1.0.4_amd64.deb
make appimage       # → build/dist/LokaDev-1.0.4-x86_64.AppImage
```

## Project Structure

```
lokadev-app/
├── main.go                        Entry point
├── go.mod
├── Makefile                       Build for all platforms
├── cmd/lokadev/                   CLI commands (cobra)
│   ├── root.go                    Root command + version
│   ├── create.go                  lokadev create
│   ├── project_cmds.go            start/stop/restart/delete/list/logs/shell
│   ├── db.go                      lokadev db add/shell/dump/restore
│   ├── service.go                 lokadev service start/stop
│   └── platform_helpers.go        OS-specific helpers
├── internal/
│   ├── container/
│   │   ├── namespace_linux.go     Linux user namespaces (rootless)
│   │   └── namespace_windows.go   Windows Job Objects
│   ├── server/manager.go          Nginx / Apache / Caddy management
│   ├── database/manager.go        MySQL / PostgreSQL / Redis / SQLite
│   ├── projects/project.go        Project config (lokadev.toml)
│   └── config/config.go           Global daemon config
└── build/
    └── fedora/
        ├── lokadev.spec            RPM spec file
        ├── lokadev.service         systemd unit
        └── lokadev.desktop         .desktop entry
```

## License

MIT — free and open source forever.
