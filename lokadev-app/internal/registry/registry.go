package registry

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

type Status string

const (
	StatusRunning Status = "running"
	StatusStopped Status = "stopped"
	StatusError   Status = "error"
)

type ProjectEntry struct {
	Name      string    `json:"name"`
	Dir       string    `json:"dir"`
	Domain    string    `json:"domain"`
	Runtime   string    `json:"runtime"`
	Server    string    `json:"server"`
	Database  string    `json:"database"`
	Status    Status    `json:"status"`
	PIDs      []int     `json:"pids"`
	CreatedAt time.Time `json:"created_at"`
}

type Registry struct {
	Projects map[string]*ProjectEntry `json:"projects"`
	path     string
}

func registryPath() string {
	var dir string
	switch runtime.GOOS {
	case "windows":
		dir = filepath.Join(os.Getenv("APPDATA"), "LokaDev")
	default:
		home, _ := os.UserHomeDir()
		dir = filepath.Join(home, ".config", "lokadev")
	}
	return filepath.Join(dir, "projects.json")
}

func Load() (*Registry, error) {
	path := registryPath()
	r := &Registry{
		Projects: make(map[string]*ProjectEntry),
		path:     path,
	}
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return r, nil
	}
	if err != nil {
		return nil, fmt.Errorf("read registry: %w", err)
	}
	if err := json.Unmarshal(data, r); err != nil {
		return nil, fmt.Errorf("parse registry: %w", err)
	}
	r.path = path
	return r, nil
}

func (r *Registry) Save() error {
	if err := os.MkdirAll(filepath.Dir(r.path), 0755); err != nil {
		return fmt.Errorf("create config dir: %w", err)
	}
	data, err := json.MarshalIndent(r, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal registry: %w", err)
	}
	return os.WriteFile(r.path, data, 0644)
}

func (r *Registry) Add(e *ProjectEntry) error {
	if _, exists := r.Projects[e.Name]; exists {
		return fmt.Errorf("project '%s' already exists", e.Name)
	}
	r.Projects[e.Name] = e
	return r.Save()
}

func (r *Registry) Get(name string) (*ProjectEntry, bool) {
	e, ok := r.Projects[name]
	return e, ok
}

func (r *Registry) SetStatus(name string, s Status, pids []int) error {
	e, ok := r.Projects[name]
	if !ok {
		return fmt.Errorf("project '%s' not found", name)
	}
	e.Status = s
	e.PIDs = pids
	return r.Save()
}

func (r *Registry) Remove(name string) error {
	if _, ok := r.Projects[name]; !ok {
		return fmt.Errorf("project '%s' not found", name)
	}
	delete(r.Projects, name)
	return r.Save()
}

func (r *Registry) All() []*ProjectEntry {
	list := make([]*ProjectEntry, 0, len(r.Projects))
	for _, e := range r.Projects {
		list = append(list, e)
	}
	return list
}

func (r *Registry) ReconcileStatus() {
	for _, e := range r.Projects {
		if e.Status != StatusRunning {
			continue
		}
		alive := false
		for _, pid := range e.PIDs {
			proc, err := os.FindProcess(pid)
			if err != nil {
				continue
			}
			if isAlive(proc) {
				alive = true
				break
			}
		}
		if !alive {
			e.Status = StatusStopped
			e.PIDs = nil
		}
	}
	_ = r.Save()
}
