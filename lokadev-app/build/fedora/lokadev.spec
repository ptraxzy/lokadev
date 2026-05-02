Name:           lokadev
Version:        %{_version}
Release:        1%{?dist}
Summary:        Next-generation local development environment
License:        MIT
URL:            https://lokadev.app
Source0:        lokadev
Source1:        lokadev.service

Requires:       nginx >= 1.20
Requires:       php-fpm >= 7.4
Requires:       mysql-server >= 8.0
Recommends:     postgresql-server >= 15
Recommends:     redis >= 6

BuildArch:      x86_64

%description
LokaDev is a next-generation local development environment for Fedora/Linux.
It lets you run multiple isolated projects simultaneously — each with their
own web server, database, and runtime versions — without Docker overhead.

Features:
  - Docker-like project isolation via Linux user namespaces
  - Built-in web servers: Nginx, Apache, Caddy
  - Multi-version PHP, Node.js, Python, Go per project
  - Built-in databases: MySQL, PostgreSQL, SQLite, Redis
  - Beautiful web dashboard at http://localhost:25000
  - Full CLI: lokadev create/start/stop/list/logs/shell/db
  - Fedora SELinux policy included
  - Automatic local SSL certificates via mkcert

%install
mkdir -p %{buildroot}/usr/bin
mkdir -p %{buildroot}/lib/systemd/system
mkdir -p %{buildroot}/usr/share/lokadev/selinux
install -m 0755 %{SOURCE0} %{buildroot}/usr/bin/lokadev
install -m 0644 %{SOURCE1} %{buildroot}/lib/systemd/system/lokadev.service

%files
/usr/bin/lokadev
/lib/systemd/system/lokadev.service

%post
systemctl daemon-reload

%preun
if [ $1 -eq 0 ]; then
    systemctl stop lokadev || true
    systemctl disable lokadev || true
fi

%postun
systemctl daemon-reload

%changelog
* Thu May 02 2026 LokaDev Team <hello@lokadev.app> - 1.0.4-1
- Initial Fedora package release
- Added SELinux policy module
- Added user namespace support for rootless isolation
- Full CLI and web dashboard included
