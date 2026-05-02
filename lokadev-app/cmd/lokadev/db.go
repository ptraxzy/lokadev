package lokadev

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var dbCmd = &cobra.Command{
	Use:   "db",
	Short: "Manage project databases",
}

var dbAddCmd = &cobra.Command{
	Use:   "add [project]",
	Short: "Add a database to a project",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		project := args[0]
		dbType, _ := cmd.Flags().GetString("type")
		fmt.Printf("  %s Added %s database to %s\n", color.GreenString("✔"), dbType, project)
		return nil
	},
}

var dbShellCmd = &cobra.Command{
	Use:   "shell [project]",
	Short: "Connect to the project database shell",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		project := args[0]
		fmt.Printf("Connecting to database for '%s'...\n", project)
		return enterDBShell(project)
	},
}

var dbDumpCmd = &cobra.Command{
	Use:   "dump [project]",
	Short: "Dump project database to stdout",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		project := args[0]
		return dumpDatabase(project)
	},
}

var dbRestoreCmd = &cobra.Command{
	Use:   "restore [project]",
	Short: "Restore database from stdin",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		project := args[0]
		return restoreDatabase(project)
	},
}

func init() {
	dbAddCmd.Flags().String("type", "mysql", "Database type (mysql, postgres, sqlite, redis)")
	dbCmd.AddCommand(dbAddCmd)
	dbCmd.AddCommand(dbShellCmd)
	dbCmd.AddCommand(dbDumpCmd)
	dbCmd.AddCommand(dbRestoreCmd)
}
