#!/usr/bin/env bash
set -e

REPO="ptraxzy/lokadev"
VERSION="1.0.4"
INSTALL_DIR="/usr/local/bin"
BINARY="lokadev"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${CYAN}  →${NC} $1"; }
ok()   { echo -e "${GREEN}  ✔${NC} $1"; }
err()  { echo -e "${RED}  ✗${NC} $1"; exit 1; }

echo ""
echo -e "${BOLD}  LokaDev Installer v${VERSION}${NC}"
echo -e "  https://github.com/${REPO}"
echo ""

# Detect OS and package manager
OS="$(uname -s)"
ARCH="$(uname -m)"

if [ "$OS" != "Linux" ]; then
  err "This installer is for Linux only. Windows users: download lokadev.exe from https://github.com/${REPO}/releases"
fi

if [ "$ARCH" != "x86_64" ]; then
  err "Only x86_64 is supported. Got: $ARCH"
fi

# Detect distro and install method
if command -v dnf &>/dev/null; then
  DISTRO="fedora"
elif command -v apt-get &>/dev/null; then
  DISTRO="debian"
else
  DISTRO="generic"
fi

log "Detected: Linux ($ARCH) / $DISTRO"

# Download and install
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

case "$DISTRO" in
  fedora)
    RPM_FILE="lokadev-${VERSION}.x86_64.rpm"
    URL="https://github.com/${REPO}/releases/latest/download/${RPM_FILE}"
    log "Downloading ${RPM_FILE}..."
    curl -fsSL -o "$TMPDIR/$RPM_FILE" "$URL"
    log "Installing via dnf..."
    sudo dnf install -y "$TMPDIR/$RPM_FILE"
    ;;
  debian)
    DEB_FILE="lokadev_${VERSION}_amd64.deb"
    URL="https://github.com/${REPO}/releases/latest/download/${DEB_FILE}"
    log "Downloading ${DEB_FILE}..."
    curl -fsSL -o "$TMPDIR/$DEB_FILE" "$URL"
    log "Installing via dpkg..."
    sudo dpkg -i "$TMPDIR/$DEB_FILE"
    ;;
  generic)
    URL="https://github.com/${REPO}/releases/latest/download/lokadev"
    log "Downloading binary..."
    curl -fsSL -o "$TMPDIR/$BINARY" "$URL"
    chmod +x "$TMPDIR/$BINARY"
    log "Installing to ${INSTALL_DIR}..."
    sudo mv "$TMPDIR/$BINARY" "${INSTALL_DIR}/${BINARY}"
    ;;
esac

echo ""
ok "LokaDev v${VERSION} installed!"
echo ""
echo -e "  Run ${CYAN}lokadev --help${NC} to get started."
echo -e "  Docs: ${CYAN}https://github.com/${REPO}${NC}"
echo ""

# Fedora post-install tips
if [ "$DISTRO" = "fedora" ]; then
  echo -e "  ${BOLD}Fedora users:${NC} Enable user namespaces if not already done:"
  echo -e "  ${CYAN}  sudo sysctl -w user.max_user_namespaces=15000${NC}"
  echo ""
fi
