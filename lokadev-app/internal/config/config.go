package config

import (
	"os"
	"path/filepath"
	"runtime"

	"github.com/BurntSushi/toml"
)

// GlobalConfig is the top-level LokaDev daemon configuration.
type GlobalConfig struct {
	Dashboard DashboardConfig `toml:"dashboard"`
	Projects  ProjectsConfig  `toml:"projects"`
	SSL       SSLConfig       `toml:"ssl"`
	Telemetry TelemetryConfig `toml:"telemetry"`
}

type DashboardConfig struct {
	Port int    `toml:"port"` // default 25000
	Host string `toml:"host"` // default 127.0.0.1
}

type ProjectsConfig struct {
	Dir string `toml:"dir"` // root dir for all projects
}

type SSLConfig struct {
	CADir string `toml:"ca_dir"` // where mkcert stores root CA
}

type TelemetryConfig struct {
	Enabled bool `toml:"enabled"` // default false
}

// Default returns a GlobalConfig with sensible defaults for the current OS.
func Default() GlobalConfig {
	return GlobalConfig{
		Dashboard: DashboardConfig{Port: 25000, Host: "127.0.0.1"},
		Projects:  ProjectsConfig{Dir: defaultProjectsDir()},
		SSL:       SSLConfig{CADir: defaultSSLDir()},
		Telemetry: TelemetryConfig{Enabled: false},
	}
}

// Load reads the global config from the user config directory.
func Load() (GlobalConfig, error) {
	path := ConfigPath()
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return Default(), nil
	}
	if err != nil {
		return GlobalConfig{}, err
	}

	var cfg GlobalConfig
	if _, err := toml.Decode(string(data), &cfg); err != nil {
		return GlobalConfig{}, err
	}
	return cfg, nil
}

// Save writes the config to disk.
func Save(cfg GlobalConfig) error {
	path := ConfigPath()
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	return toml.NewEncoder(f).Encode(cfg)
}

// ConfigPath returns the platform-specific config file path.
func ConfigPath() string {
	return filepath.Join(configDir(), "lokadev.toml")
}

func configDir() string {
	switch runtime.GOOS {
	case "windows":
		return filepath.Join(os.Getenv("APPDATA"), "LokaDev")
	default:
		home, _ := os.UserHomeDir()
		return filepath.Join(home, ".config", "lokadev")
	}
}

func defaultProjectsDir() string {
	switch runtime.GOOS {
	case "windows":
		return filepath.Join(os.Getenv("USERPROFILE"), "lokadev-projects")
	default:
		home, _ := os.UserHomeDir()
		return filepath.Join(home, "lokadev-projects")
	}
}

func defaultSSLDir() string {
	switch runtime.GOOS {
	case "windows":
		return filepath.Join(os.Getenv("LOCALAPPDATA"), "mkcert")
	default:
		home, _ := os.UserHomeDir()
		return filepath.Join(home, ".local", "share", "mkcert")
	}
}
