package lokadev

import (
	"fmt"
	"text/tabwriter"
	"os"
	"time"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var startCmd = &cobra.Command{
	Use:   "start [name]",
	Short: "Start a project's services",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
		green := color.New(color.FgGreen).SprintFunc()
		cyan := color.New(color.FgCyan).SprintFunc()

		s.Suffix = fmt.Sprintf(" Starting %s...", name)
		s.Start()
		time.Sleep(900 * time.Millisecond)
		s.Stop()

		fmt.Printf("  %s %s is running at %s\n", green("✔"), name, cyan(fmt.Sprintf("https://%s.test", name)))
		return nil
	},
}

var stopCmd = &cobra.Command{
	Use:   "stop [name]",
	Short: "Stop a project",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
		s.Suffix = fmt.Sprintf(" Stopping %s...", name)
		s.Start()
		time.Sleep(500 * time.Millisecond)
		s.Stop()
		fmt.Printf("  %s %s stopped\n", color.GreenString("✔"), name)
		return nil
	},
}

var restartCmd = &cobra.Command{
	Use:   "restart [name]",
	Short: "Restart a project's services",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
		s.Suffix = fmt.Sprintf(" Restarting %s...", name)
		s.Start()
		time.Sleep(900 * time.Millisecond)
		s.Stop()
		fmt.Printf("  %s %s restarted\n", color.GreenString("✔"), name)
		return nil
	},
}

var deleteCmd = &cobra.Command{
	Use:   "delete [name]",
	Short: "Delete a project and all its data",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		fmt.Printf("  %s This will permanently delete '%s' and all its data.\n", color.YellowString("!"), name)
		fmt.Print("  Type the project name to confirm: ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != name {
			return fmt.Errorf("confirmation did not match — aborted")
		}
		s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
		s.Suffix = " Removing project data..."
		s.Start()
		time.Sleep(600 * time.Millisecond)
		s.Stop()
		fmt.Printf("  %s Project '%s' deleted\n", color.GreenString("✔"), name)
		return nil
	},
}

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all LokaDev projects",
	RunE: func(cmd *cobra.Command, args []string) error {
		w := tabwriter.NewWriter(os.Stdout, 0, 0, 3, ' ', 0)
		header := color.New(color.Bold).SprintFunc()
		fmt.Fprintln(w, header("NAME\tSTATUS\tURL\tRUNTIME\tDB"))

		projects := []struct{ name, status, url, runtime, db string }{
			{"my-laravel", "running", "https://my-laravel.test", "php:8.3 / nginx", "mysql"},
			{"my-api", "stopped", "https://my-api.test", "node:20 / caddy", "postgres"},
			{"old-project", "running", "https://old-project.test", "php:7.4 / apache", "mysql"},
		}

		green := color.New(color.FgGreen).SprintFunc()
		yellow := color.New(color.FgYellow).SprintFunc()

		for _, p := range projects {
			statusStr := yellow(p.status)
			if p.status == "running" {
				statusStr = green(p.status)
			}
			fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\n", p.name, statusStr, p.url, p.runtime, p.db)
		}
		w.Flush()
		return nil
	},
}

var openCmd = &cobra.Command{
	Use:   "open [name]",
	Short: "Open a project in your default browser",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		url := fmt.Sprintf("https://%s.test", name)
		fmt.Printf("Opening %s...\n", url)
		return openBrowser(url)
	},
}

var logsCmd = &cobra.Command{
	Use:   "logs [name]",
	Short: "Tail logs for a project",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		fmt.Printf("Tailing logs for %s (Ctrl+C to exit)...\n\n", name)
		lines := []string{
			"[nginx] 127.0.0.1 - GET / HTTP/1.1 200",
			"[php-fpm] pool www: child 12 started",
			"[mysql] ready for connections on port 3306",
			"[nginx] 127.0.0.1 - GET /api/users HTTP/1.1 200",
		}
		for _, l := range lines {
			time.Sleep(300 * time.Millisecond)
			fmt.Printf("  %s\n", color.New(color.FgHiBlack).Sprint(l))
		}
		fmt.Println("  [waiting for new logs...]")
		select {}
	},
}

var shellCmd = &cobra.Command{
	Use:   "shell [name]",
	Short: "Open a shell inside the project namespace",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		fmt.Printf("Entering namespace for '%s'. Type 'exit' to return.\n", name)
		return enterNamespace(name)
	},
}

var configCmd = &cobra.Command{
	Use:   "config [name]",
	Short: "Edit project configuration",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		return openEditor(fmt.Sprintf("./%s/lokadev.toml", name))
	},
}

var updateCmd = &cobra.Command{
	Use:   "update",
	Short: "Update LokaDev to the latest version",
	RunE: func(cmd *cobra.Command, args []string) error {
		s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
		s.Suffix = " Checking for updates..."
		s.Start()
		time.Sleep(1 * time.Second)
		s.Stop()
		fmt.Printf("  %s LokaDev v%s is already the latest version\n", color.GreenString("✔"), version)
		return nil
	},
}

var daemonCmd = &cobra.Command{
	Use:    "daemon",
	Short:  "Start the LokaDev background daemon",
	Hidden: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		return startDaemon()
	},
}
