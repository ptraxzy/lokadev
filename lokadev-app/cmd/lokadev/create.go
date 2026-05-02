package lokadev

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"time"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/lokadev/lokadev/internal/projects"
	"github.com/lokadev/lokadev/internal/registry"
	"github.com/spf13/cobra"
)

var (
	createRuntime string
	createServer  string
	createDB      string
)

var nameRe = regexp.MustCompile(`^[a-zA-Z0-9][a-zA-Z0-9\-]{0,62}$`)

var createCmd = &cobra.Command{
	Use:   "create [name]",
	Short: "Create a new project",
	Long: `Create a new isolated LokaDev project.

Each project gets its own directory, web server config, database,
and runtime. Projects are accessible at https://<name>.test.

Examples:
  lokadev create my-app
  lokadev create my-laravel --runtime=php:8.3 --server=nginx --db=mysql
  lokadev create my-api     --runtime=node:20  --server=caddy --db=postgres`,
	Args: cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := ""
		if len(args) > 0 {
			name = args[0]
		} else {
			fmt.Print("Project name: ")
			fmt.Scanln(&name)
		}
		if name == "" {
			return fmt.Errorf("project name is required")
		}
		if !nameRe.MatchString(name) {
			return fmt.Errorf("invalid project name: use only letters, numbers, and hyphens")
		}

		reg, err := registry.Load()
		if err != nil {
			return fmt.Errorf("load registry: %w", err)
		}
		if _, exists := reg.Get(name); exists {
			return fmt.Errorf("project '%s' already exists — use 'lokadev list' to see all projects", name)
		}

		green := color.New(color.FgGreen).SprintFunc()
		cyan := color.New(color.FgCyan).SprintFunc()
		s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)

		projectsDir, err := defaultProjectsDir()
		if err != nil {
			return err
		}
		projectDir := filepath.Join(projectsDir, name)

		s.Suffix = " Creating project directory..."
		s.Start()
		dirs := []string{
			projectDir,
			filepath.Join(projectDir, ".lokadev", "logs"),
			filepath.Join(projectDir, ".lokadev", "conf"),
			filepath.Join(projectDir, ".lokadev", "db"),
			filepath.Join(projectDir, "public"),
		}
		for _, d := range dirs {
			if err := os.MkdirAll(d, 0755); err != nil {
				s.Stop()
				return fmt.Errorf("create dir %s: %w", d, err)
			}
		}
		s.Stop()
		fmt.Printf("  %s Created project directory at %s\n", green("✔"), cyan(projectDir))

		s.Suffix = " Writing project configuration..."
		s.Start()
		cfg := projects.DefaultConfig(name, createRuntime, createServer, createDB)
		proj := &projects.Project{Config: cfg, Dir: projectDir, Status: projects.StatusStopped}
		if err := proj.Save(); err != nil {
			s.Stop()
			return fmt.Errorf("write lokadev.toml: %w", err)
		}

		indexContent := fmt.Sprintf("<?php\n// %s — created by LokaDev\necho '<h1>%s is running!</h1>';\n", name, name)
		_ = os.WriteFile(filepath.Join(projectDir, "public", "index.php"), []byte(indexContent), 0644)
		s.Stop()
		fmt.Printf("  %s Configuration written to %s\n", green("✔"), cyan(filepath.Join(projectDir, "lokadev.toml")))

		s.Suffix = " Registering project..."
		s.Start()
		entry := &registry.ProjectEntry{
			Name:      name,
			Dir:       projectDir,
			Domain:    fmt.Sprintf("%s.test", name),
			Runtime:   createRuntime,
			Server:    createServer,
			Database:  createDB,
			Status:    registry.StatusStopped,
			CreatedAt: time.Now(),
		}
		if err := reg.Add(entry); err != nil {
			s.Stop()
			return err
		}
		s.Stop()
		fmt.Printf("  %s Project registered\n", green("✔"))

		fmt.Printf("\n  %s Project %s created at %s\n\n",
			color.New(color.FgMagenta).Sprint("✨"),
			cyan(name),
			cyan(fmt.Sprintf("https://%s.test", name)),
		)
		fmt.Printf("  Run %s to start.\n", cyan(fmt.Sprintf("lokadev start %s", name)))
		return nil
	},
}

func defaultProjectsDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("get home dir: %w", err)
	}
	return filepath.Join(home, "lokadev-projects"), nil
}

func init() {
	createCmd.Flags().StringVar(&createRuntime, "runtime", "php:8.3", "Runtime (e.g. php:8.3, node:20, python:3.12)")
	createCmd.Flags().StringVar(&createServer, "server", "nginx", "Web server (nginx, apache, caddy)")
	createCmd.Flags().StringVar(&createDB, "db", "mysql", "Database (mysql, postgres, sqlite, none)")
}
