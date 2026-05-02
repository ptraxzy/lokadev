package projects

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
)

// Status represents the running state of a project.
type Status string

const (
	StatusRunning Status = "running"
	StatusStopped Status = "stopped"
	StatusError   Status = "error"
)

// RuntimeConfig holds per-project runtime settings from lokadev.toml.
type RuntimeConfig struct {
	PHP  string `toml:"php"`
	Node string `toml:"node"`
	Go   string `toml:"go"`
}

// ServerConfig holds web server settings.
type ServerConfig struct {
	Type string `toml:"type"`
	Port int    `toml:"port"`
	SSL  bool   `toml:"ssl"`
}

// DatabaseConfig holds database settings.
type DatabaseConfig struct {
	Type    string `toml:"type"`
	Version string `toml:"version"`
	Name    string `toml:"name"`
}

// ProjectConfig is the full lokadev.toml schema.
type ProjectConfig struct {
	Project struct {
		Name   string `toml:"name"`
		Domain string `toml:"domain"`
	} `toml:"project"`
	Runtime     RuntimeConfig     `toml:"runtime"`
	Server      ServerConfig      `toml:"server"`
	Database    DatabaseConfig    `toml:"database"`
	Environment map[string]string `toml:"environment"`
}

// Project represents a LokaDev project instance.
type Project struct {
	Config  ProjectConfig
	Dir     string
	Status  Status
	PID     int
}

// Load reads a project from its directory.
func Load(dir string) (*Project, error) {
	confPath := filepath.Join(dir, "lokadev.toml")
	data, err := os.ReadFile(confPath)
	if err != nil {
		return nil, fmt.Errorf("read lokadev.toml: %w", err)
	}

	var cfg ProjectConfig
	if _, err := toml.Decode(string(data), &cfg); err != nil {
		return nil, fmt.Errorf("parse lokadev.toml: %w", err)
	}

	return &Project{
		Config: cfg,
		Dir:    dir,
		Status: StatusStopped,
	}, nil
}

// Save writes the project config back to lokadev.toml.
func (p *Project) Save() error {
	confPath := filepath.Join(p.Dir, "lokadev.toml")
	f, err := os.Create(confPath)
	if err != nil {
		return fmt.Errorf("open lokadev.toml: %w", err)
	}
	defer f.Close()
	return toml.NewEncoder(f).Encode(p.Config)
}

// DefaultConfig returns a sensible default project config.
func DefaultConfig(name, runtime, server, db string) ProjectConfig {
	cfg := ProjectConfig{}
	cfg.Project.Name = name
	cfg.Project.Domain = fmt.Sprintf("%s.test", name)
	cfg.Server.Type = server
	cfg.Server.Port = 443
	cfg.Server.SSL = true
	cfg.Database.Type = db
	cfg.Database.Name = fmt.Sprintf("%s_db", name)
	cfg.Environment = map[string]string{
		"APP_ENV":   "local",
		"APP_DEBUG": "true",
	}

	// Parse runtime string like "php:8.3"
	if len(runtime) > 4 && runtime[:4] == "php:" {
		cfg.Runtime.PHP = runtime[4:]
	} else if len(runtime) > 5 && runtime[:5] == "node:" {
		cfg.Runtime.Node = runtime[5:]
	}

	return cfg
}
