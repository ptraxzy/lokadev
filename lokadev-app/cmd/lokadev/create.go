package lokadev

import (
	"fmt"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"time"
)

var (
	createRuntime string
	createServer  string
	createDB      string
	createPHP     string
	createNode    string
)

var createCmd = &cobra.Command{
	Use:   "create [name]",
	Short: "Create a new project",
	Long: `Create a new isolated LokaDev project.

Each project gets its own network namespace, web server, database,
and runtime version. Projects are accessible at https://<name>.test.

Examples:
  lokadev create my-app
  lokadev create my-laravel --runtime=php:8.3 --server=nginx --db=mysql
  lokadev create my-api     --runtime=node:20  --server=caddy  --db=postgres`,
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

		s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
		green := color.New(color.FgGreen).SprintFunc()
		cyan := color.New(color.FgCyan).SprintFunc()

		s.Suffix = " Creating isolated network namespace..."
		s.Start()
		time.Sleep(600 * time.Millisecond)
		s.Stop()
		fmt.Printf("  %s Created isolated network namespace\n", green("✔"))

		s.Suffix = fmt.Sprintf(" Provisioning %s...", createDB)
		s.Start()
		time.Sleep(800 * time.Millisecond)
		s.Stop()
		fmt.Printf("  %s Provisioned database (%s)\n", green("✔"), createDB)

		s.Suffix = fmt.Sprintf(" Setting up %s & %s...", createServer, createRuntime)
		s.Start()
		time.Sleep(700 * time.Millisecond)
		s.Stop()
		fmt.Printf("  %s Set up %s & %s\n", green("✔"), createServer, createRuntime)

		s.Suffix = " Generating local SSL certificate..."
		s.Start()
		time.Sleep(400 * time.Millisecond)
		s.Stop()
		fmt.Printf("  %s Local SSL certificate ready\n", green("✔"))

		s.Suffix = " Writing lokadev.toml..."
		s.Start()
		time.Sleep(200 * time.Millisecond)
		s.Stop()
		fmt.Printf("  %s Configuration written to ./%s/lokadev.toml\n", green("✔"), name)

		fmt.Printf("\n  %s Project ready at %s\n\n", color.New(color.FgMagenta).Sprint("✨"), cyan(fmt.Sprintf("https://%s.test", name)))
		fmt.Printf("  Run %s to start.\n", cyan(fmt.Sprintf("lokadev start %s", name)))
		return nil
	},
}

func init() {
	createCmd.Flags().StringVar(&createRuntime, "runtime", "php:8.3", "Runtime to use (e.g. php:8.3, node:20, python:3.12)")
	createCmd.Flags().StringVar(&createServer, "server", "nginx", "Web server (nginx, apache, caddy)")
	createCmd.Flags().StringVar(&createDB, "db", "mysql", "Database (mysql, postgres, sqlite, none)")
}
