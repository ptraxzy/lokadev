package database

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// DBType represents a supported database engine.
type DBType string

const (
	MySQL    DBType = "mysql"
	Postgres DBType = "postgres"
	SQLite   DBType = "sqlite"
	Redis    DBType = "redis"
)

// Config holds configuration for a database instance.
type Config struct {
	Type       DBType
	ProjectDir string
	Name       string
	Port       int
	Password   string
}

// Manager manages a database instance for a project.
type Manager struct {
	cfg  Config
	proc *os.Process
}

// NewManager returns a new database manager.
func NewManager(cfg Config) *Manager {
	return &Manager{cfg: cfg}
}

// Start initializes and starts the database for the project.
func (m *Manager) Start() error {
	dataDir := filepath.Join(m.cfg.ProjectDir, ".lokadev", "db", string(m.cfg.Type))
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return fmt.Errorf("create db data dir: %w", err)
	}

	var cmd *exec.Cmd
	switch m.cfg.Type {
	case MySQL:
		if err := m.initMySQL(dataDir); err != nil {
			return err
		}
		cmd = exec.Command("mysqld",
			fmt.Sprintf("--datadir=%s", dataDir),
			fmt.Sprintf("--port=%d", m.cfg.Port),
			"--skip-networking=0",
			"--bind-address=127.0.0.1",
		)
	case Postgres:
		if err := m.initPostgres(dataDir); err != nil {
			return err
		}
		cmd = exec.Command("postgres",
			"-D", dataDir,
			"-p", fmt.Sprintf("%d", m.cfg.Port),
		)
	case Redis:
		cmd = exec.Command("redis-server",
			"--port", fmt.Sprintf("%d", m.cfg.Port),
			"--dir", dataDir,
		)
	case SQLite:
		// SQLite is file-based, no daemon needed
		return nil
	default:
		return fmt.Errorf("unsupported database type: %s", m.cfg.Type)
	}

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start %s: %w", m.cfg.Type, err)
	}
	m.proc = cmd.Process
	return nil
}

// Stop shuts down the database process.
func (m *Manager) Stop() error {
	if m.proc == nil {
		return nil
	}
	return m.proc.Signal(os.Interrupt)
}

// DSN returns a connection string for the database.
func (m *Manager) DSN() string {
	switch m.cfg.Type {
	case MySQL:
		return fmt.Sprintf("mysql://root:%s@127.0.0.1:%d/%s", m.cfg.Password, m.cfg.Port, m.cfg.Name)
	case Postgres:
		return fmt.Sprintf("postgres://lokadev:%s@127.0.0.1:%d/%s?sslmode=disable", m.cfg.Password, m.cfg.Port, m.cfg.Name)
	case SQLite:
		return filepath.Join(m.cfg.ProjectDir, ".lokadev", "db", m.cfg.Name+".sqlite")
	case Redis:
		return fmt.Sprintf("redis://127.0.0.1:%d", m.cfg.Port)
	}
	return ""
}

func (m *Manager) initMySQL(dataDir string) error {
	// Check if already initialized
	if _, err := os.Stat(filepath.Join(dataDir, "mysql")); err == nil {
		return nil
	}
	cmd := exec.Command("mysqld", "--initialize-insecure",
		fmt.Sprintf("--datadir=%s", dataDir))
	return cmd.Run()
}

func (m *Manager) initPostgres(dataDir string) error {
	if _, err := os.Stat(filepath.Join(dataDir, "PG_VERSION")); err == nil {
		return nil
	}
	cmd := exec.Command("initdb", "-D", dataDir, "-U", "lokadev")
	return cmd.Run()
}
