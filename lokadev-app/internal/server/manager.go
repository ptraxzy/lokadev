package server

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// ServerType represents a supported web server.
type ServerType string

const (
	Nginx  ServerType = "nginx"
	Apache ServerType = "apache"
	Caddy  ServerType = "caddy"
)

// Config holds configuration for a web server instance.
type Config struct {
	Type       ServerType
	ProjectDir string
	Domain     string
	Port       int
	SSLCert    string
	SSLKey     string
	PHPSocket  string
}

// Manager manages web server processes for a project.
type Manager struct {
	cfg  Config
	proc *os.Process
}

// NewManager creates a new server manager.
func NewManager(cfg Config) *Manager {
	return &Manager{cfg: cfg}
}

// Start writes a server config and starts the server process.
func (m *Manager) Start() error {
	confPath, err := m.writeConfig()
	if err != nil {
		return fmt.Errorf("write config: %w", err)
	}

	var cmd *exec.Cmd
	switch m.cfg.Type {
	case Nginx:
		cmd = exec.Command("nginx", "-c", confPath, "-g", "daemon off;")
	case Apache:
		cmd = exec.Command("httpd", "-f", confPath, "-DFOREGROUND")
	case Caddy:
		cmd = exec.Command("caddy", "run", "--config", confPath)
	default:
		return fmt.Errorf("unknown server type: %s", m.cfg.Type)
	}

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start %s: %w", m.cfg.Type, err)
	}
	m.proc = cmd.Process
	return nil
}

// Stop sends SIGTERM to the server process.
func (m *Manager) Stop() error {
	if m.proc == nil {
		return nil
	}
	return m.proc.Signal(os.Interrupt)
}

// writeConfig generates a server config file for the project.
func (m *Manager) writeConfig() (string, error) {
	confDir := filepath.Join(m.cfg.ProjectDir, ".lokadev", "conf")
	if err := os.MkdirAll(confDir, 0755); err != nil {
		return "", err
	}

	var confContent string
	switch m.cfg.Type {
	case Nginx:
		confContent = m.nginxConfig()
	case Caddy:
		confContent = m.caddyConfig()
	default:
		confContent = m.apacheConfig()
	}

	confPath := filepath.Join(confDir, fmt.Sprintf("%s.conf", m.cfg.Type))
	if err := os.WriteFile(confPath, []byte(confContent), 0644); err != nil {
		return "", err
	}
	return confPath, nil
}

func (m *Manager) nginxConfig() string {
	return fmt.Sprintf(`
server {
    listen %d ssl;
    server_name %s;

    ssl_certificate     %s;
    ssl_certificate_key %s;

    root %s/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:%s;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
`, m.cfg.Port, m.cfg.Domain, m.cfg.SSLCert, m.cfg.SSLKey,
		m.cfg.ProjectDir, m.cfg.PHPSocket)
}

func (m *Manager) caddyConfig() string {
	return fmt.Sprintf(`
%s {
    tls %s %s
    root * %s/public
    php_fastcgi unix/%s
    file_server
}
`, m.cfg.Domain, m.cfg.SSLCert, m.cfg.SSLKey, m.cfg.ProjectDir, m.cfg.PHPSocket)
}

func (m *Manager) apacheConfig() string {
	return fmt.Sprintf(`
<VirtualHost *:%d>
    ServerName %s
    DocumentRoot %s/public
    SSLEngine on
    SSLCertificateFile    %s
    SSLCertificateKeyFile %s

    <FilesMatch \.php$>
        SetHandler "proxy:unix:%s|fcgi://localhost/"
    </FilesMatch>
</VirtualHost>
`, m.cfg.Port, m.cfg.Domain, m.cfg.ProjectDir, m.cfg.SSLCert, m.cfg.SSLKey, m.cfg.PHPSocket)
}
