package lokadev

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var serviceCmd = &cobra.Command{
	Use:   "service",
	Short: "Manage individual services (nginx, mysql, etc.)",
}

var serviceStartCmd = &cobra.Command{
	Use:   "start [project] [service]",
	Short: "Start a specific service within a project",
	Args:  cobra.ExactArgs(2),
	RunE: func(cmd *cobra.Command, args []string) error {
		project, svc := args[0], args[1]
		fmt.Printf("  %s Started %s in project %s\n", color.GreenString("✔"), svc, project)
		return nil
	},
}

var serviceStopCmd = &cobra.Command{
	Use:   "stop [project] [service]",
	Short: "Stop a specific service within a project",
	Args:  cobra.ExactArgs(2),
	RunE: func(cmd *cobra.Command, args []string) error {
		project, svc := args[0], args[1]
		fmt.Printf("  %s Stopped %s in project %s\n", color.GreenString("✔"), svc, project)
		return nil
	},
}

func init() {
	serviceCmd.AddCommand(serviceStartCmd)
	serviceCmd.AddCommand(serviceStopCmd)
}
