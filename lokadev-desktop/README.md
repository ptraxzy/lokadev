# LokaDev Desktop

Native desktop application for LokaDev, built with [Tauri](https://tauri.app) (Rust) + React + Vite.

## Prerequisites

### Fedora / RHEL

```bash
sudo dnf install -y \
  gcc \
  webkit2gtk4.0-devel \
  openssl-devel \
  curl \
  wget \
  libayatana-appindicator-gtk3-devel \
  librsvg2-devel

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### Debian / Ubuntu

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### Windows

- Install [Rust](https://www.rust-lang.org/tools/install) (MSVC toolchain)
- Install [Node.js 20+](https://nodejs.org/)
- WebView2 is bundled automatically

## Building

```bash
cd lokadev-desktop

# Install Node dependencies
npm install

# Development (hot-reload)
npm run tauri dev

# Production build
npm run tauri build
```

Output binaries will be in `src-tauri/target/release/bundle/`:
- Linux: `.deb`, `.rpm`, `.AppImage`
- Windows: `.msi`, `.exe` (NSIS installer)

## Icons

Generate proper icons from the SVG source:

```bash
npm run tauri icon ../assets/lokadev-icon.svg
```

This creates all required icon sizes in `src-tauri/icons/`.

## Architecture

```
lokadev-desktop/
├── src/              # React frontend (Vite)
│   ├── App.tsx       # Main dashboard UI
│   └── index.css     # Tailwind styles
└── src-tauri/
    ├── src/main.rs   # Rust backend
    │   ├── list_projects() → polls daemon API at :25000
    │   ├── run_lokadev()   → executes lokadev CLI commands
    │   └── start_daemon()  → starts background daemon
    └── tauri.conf.json
```

## How it works

1. On launch, the app auto-starts the `lokadev daemon` in background
2. The React UI polls `http://localhost:25000/api/projects` every 3 seconds
3. CLI actions (start/stop/create) invoke the `lokadev` binary via Tauri commands
4. Closing the window hides it to the system tray
5. The system tray icon gives quick access to all project actions
