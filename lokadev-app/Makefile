APP_NAME    := lokadev
VERSION     := 1.0.4
BUILD_DIR   := build/dist
GO          := go
LDFLAGS     := -s -w -X main.version=$(VERSION)

.PHONY: all windows linux-fedora linux-debian clean

all: windows linux-fedora linux-debian

## ── Windows ─────────────────────────────────────────────────────────────────
windows:
	@echo "Building for Windows (amd64)..."
	@mkdir -p $(BUILD_DIR)/windows
	GOOS=windows GOARCH=amd64 $(GO) build \
		-ldflags "$(LDFLAGS)" \
		-o $(BUILD_DIR)/windows/$(APP_NAME).exe \
		./main.go
	@echo "  → $(BUILD_DIR)/windows/$(APP_NAME).exe"

## ── Linux: Fedora / RHEL (.rpm) ─────────────────────────────────────────────
linux-fedora: linux-binary
	@echo "Building .rpm package for Fedora / RHEL..."
	@mkdir -p $(BUILD_DIR)/fedora/SOURCES $(BUILD_DIR)/fedora/SPECS
	@cp $(BUILD_DIR)/linux/$(APP_NAME) $(BUILD_DIR)/fedora/SOURCES/
	@cp build/fedora/lokadev.service $(BUILD_DIR)/fedora/SOURCES/
	@cp build/fedora/lokadev.spec    $(BUILD_DIR)/fedora/SPECS/
	rpmbuild --define "_topdir $(CURDIR)/$(BUILD_DIR)/fedora" \
	         --define "_version $(VERSION)" \
	         --define "_sourcedir $(CURDIR)/$(BUILD_DIR)/fedora/SOURCES" \
	         -bb $(BUILD_DIR)/fedora/SPECS/lokadev.spec
	@echo "  → $(BUILD_DIR)/fedora/RPMS/x86_64/lokadev-$(VERSION).x86_64.rpm"

## ── Linux: Debian / Ubuntu (.deb) ───────────────────────────────────────────
linux-debian: linux-binary
	@echo "Building .deb package for Debian / Ubuntu..."
	@mkdir -p $(BUILD_DIR)/debian/lokadev-$(VERSION)/DEBIAN
	@mkdir -p $(BUILD_DIR)/debian/lokadev-$(VERSION)/usr/bin
	@mkdir -p $(BUILD_DIR)/debian/lokadev-$(VERSION)/lib/systemd/system
	@cp $(BUILD_DIR)/linux/$(APP_NAME)    $(BUILD_DIR)/debian/lokadev-$(VERSION)/usr/bin/
	@cp build/fedora/lokadev.service      $(BUILD_DIR)/debian/lokadev-$(VERSION)/lib/systemd/system/
	@printf "Package: lokadev\nVersion: $(VERSION)\nArchitecture: amd64\n\
Maintainer: LokaDev Team <hello@lokadev.app>\n\
Depends: nginx | apache2, php-fpm, mysql-server | postgresql\n\
Description: Next-generation local development environment\n" \
		> $(BUILD_DIR)/debian/lokadev-$(VERSION)/DEBIAN/control
	dpkg-deb --build $(BUILD_DIR)/debian/lokadev-$(VERSION) \
	         $(BUILD_DIR)/debian/lokadev_$(VERSION)_amd64.deb
	@echo "  → $(BUILD_DIR)/debian/lokadev_$(VERSION)_amd64.deb"

## ── Shared Linux binary ──────────────────────────────────────────────────────
linux-binary:
	@echo "Compiling Linux binary (amd64)..."
	@mkdir -p $(BUILD_DIR)/linux
	GOOS=linux GOARCH=amd64 $(GO) build \
		-ldflags "$(LDFLAGS)" \
		-o $(BUILD_DIR)/linux/$(APP_NAME) \
		./main.go

## ── AppImage ─────────────────────────────────────────────────────────────────
appimage: linux-binary
	@echo "Building AppImage..."
	@mkdir -p $(BUILD_DIR)/appimage/LokaDev.AppDir/usr/bin
	@cp $(BUILD_DIR)/linux/$(APP_NAME) $(BUILD_DIR)/appimage/LokaDev.AppDir/usr/bin/
	@cp build/fedora/lokadev.desktop   $(BUILD_DIR)/appimage/LokaDev.AppDir/
	@cp assets/lokadev.png            $(BUILD_DIR)/appimage/LokaDev.AppDir/
	ARCH=x86_64 appimagetool $(BUILD_DIR)/appimage/LokaDev.AppDir \
	    $(BUILD_DIR)/LokaDev-$(VERSION)-x86_64.AppImage
	@echo "  → $(BUILD_DIR)/LokaDev-$(VERSION)-x86_64.AppImage"

## ── Dev ─────────────────────────────────────────────────────────────────────
run:
	$(GO) run ./main.go daemon

test:
	$(GO) test ./...

lint:
	golangci-lint run ./...

clean:
	rm -rf $(BUILD_DIR)

## ── Help ─────────────────────────────────────────────────────────────────────
help:
	@echo "LokaDev build targets:"
	@echo "  make windows       — build lokadev.exe for Windows"
	@echo "  make linux-fedora  — build .rpm for Fedora/RHEL"
	@echo "  make linux-debian  — build .deb for Debian/Ubuntu"
	@echo "  make appimage      — build AppImage (universal Linux)"
	@echo "  make all           — build all platforms"
	@echo "  make run           — run daemon locally"
	@echo "  make clean         — remove build artifacts"
