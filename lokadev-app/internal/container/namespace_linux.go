//go:build linux

package container

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
)

// Project holds runtime info for an isolated project namespace.
type Project struct {
	Name    string
	RootDir string
	PID     int
}

// CreateNamespace creates a new user + network namespace for a project.
// Uses rootless unshare — no root required at runtime on Fedora 37+.
func CreateNamespace(name, rootDir string) (*Project, error) {
	if err := os.MkdirAll(rootDir, 0755); err != nil {
		return nil, fmt.Errorf("create project dir: %w", err)
	}

	// Write a minimal namespace init script
	initScript := filepath.Join(rootDir, ".lokadev-ns-init.sh")
	script := "#!/bin/sh\nexec \"$@\"\n"
	if err := os.WriteFile(initScript, []byte(script), 0755); err != nil {
		return nil, fmt.Errorf("write init script: %w", err)
	}

	cmd := exec.Command("unshare",
		"--user",
		"--net",
		"--mount",
		"--pid",
		"--fork",
		"--map-root-user",
		initScript,
		"sleep", "infinity",
	)
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Cloneflags: syscall.CLONE_NEWUSER | syscall.CLONE_NEWNET,
	}
	cmd.Dir = rootDir

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("start namespace: %w", err)
	}

	return &Project{
		Name:    name,
		RootDir: rootDir,
		PID:     cmd.Process.Pid,
	}, nil
}

// ExecInNamespace runs a command inside the project's namespace via nsenter.
func ExecInNamespace(project *Project, command ...string) *exec.Cmd {
	args := append([]string{
		fmt.Sprintf("--target=%d", project.PID),
		"--net", "--user", "--mount", "--pid",
		"--",
	}, command...)
	return exec.Command("nsenter", args...)
}

// DestroyNamespace kills the namespace init process, cleaning up all
// child processes within it automatically.
func DestroyNamespace(project *Project) error {
	proc, err := os.FindProcess(project.PID)
	if err != nil {
		return err
	}
	return proc.Signal(syscall.SIGTERM)
}
