package lokadev

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"runtime"
)

// openBrowser opens a URL in the default system browser.
func openBrowser(url string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		return fmt.Errorf("unsupported OS: %s", runtime.GOOS)
	}
	return cmd.Start()
}

// openEditor opens a file in the user's preferred editor ($EDITOR).
func openEditor(path string) error {
	editor := os.Getenv("EDITOR")
	if editor == "" {
		editor = os.Getenv("VISUAL")
	}
	if editor == "" {
		switch runtime.GOOS {
		case "windows":
			editor = "notepad"
		default:
			editor = "nano"
		}
	}
	cmd := exec.Command(editor, path)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// enterNamespace drops into a shell inside the project namespace.
func enterNamespace(project string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "linux":
		shell := os.Getenv("SHELL")
		if shell == "" {
			shell = "/bin/bash"
		}
		cmd = exec.Command("nsenter",
			fmt.Sprintf("--target=$(cat /run/lokadev/%s.pid)", project),
			"--net", "--user", "--pid", "--", shell)
	case "windows":
		cmd = exec.Command("cmd.exe")
	default:
		return fmt.Errorf("unsupported OS: %s", runtime.GOOS)
	}
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// enterDBShell opens the appropriate database CLI shell.
func enterDBShell(project string) error {
	// In a real implementation, read project config to determine db type
	// For now, default to mysql
	cmd := exec.Command("mysql", fmt.Sprintf("--socket=/run/lokadev/%s/mysql.sock", project),
		"-u", "root")
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// dumpDatabase dumps a project database to stdout.
func dumpDatabase(project string) error {
	cmd := exec.Command("mysqldump",
		fmt.Sprintf("--socket=/run/lokadev/%s/mysql.sock", project),
		"-u", "root", "--all-databases")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// restoreDatabase restores a project database from stdin.
func restoreDatabase(project string) error {
	cmd := exec.Command("mysql",
		fmt.Sprintf("--socket=/run/lokadev/%s/mysql.sock", project),
		"-u", "root")
	cmd.Stdin = os.Stdin
	cmd.Stdout = io.Discard
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// startDaemon starts the LokaDev background daemon.
func startDaemon() error {
	fmt.Println("LokaDev daemon starting...")
	fmt.Println("Dashboard: http://localhost:25000")
	// Block forever (daemon mode)
	select {}
}
