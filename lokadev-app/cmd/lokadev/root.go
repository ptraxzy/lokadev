package lokadev

import (
	"fmt"
	"os"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var version = "1.0.4"

var rootCmd = &cobra.Command{
	Use:   "lokadev",
	Short: "LokaDev — next-generation local development environment",
	Long: fmt.Sprintf(`
%s v%s

The local development environment you've been waiting for.
Run isolated projects with multiple runtimes, databases, and
web servers — all from a single beautiful dashboard.

  Dashboard: http://localhost:25000
  Docs:      https://lokadev.app/docs
`,
		color.New(color.FgCyan, color.Bold).Sprint("LokaDev"),
		version,
	),
}

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.AddCommand(createCmd)
	rootCmd.AddCommand(startCmd)
	rootCmd.AddCommand(stopCmd)
	rootCmd.AddCommand(restartCmd)
	rootCmd.AddCommand(deleteCmd)
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(openCmd)
	rootCmd.AddCommand(logsCmd)
	rootCmd.AddCommand(shellCmd)
	rootCmd.AddCommand(dbCmd)
	rootCmd.AddCommand(serviceCmd)
	rootCmd.AddCommand(configCmd)
	rootCmd.AddCommand(updateCmd)
	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(daemonCmd)
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print LokaDev version",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("LokaDev v%s\n", version)
		fmt.Printf("Build info: go1.22 %s/%s\n", detectOS(), detectArch())
	},
}

func detectOS() string {
	switch os.Getenv("GOOS") {
	case "windows":
		return "windows"
	case "linux":
		return "linux"
	default:
		return "linux"
	}
}

func detectArch() string {
	return "amd64"
}
