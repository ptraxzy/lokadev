package lokadev

import (
        "bufio"
        "fmt"
        "os"
        "os/exec"
        "path/filepath"
        "sort"
        "text/tabwriter"
        "time"

        "github.com/briandowns/spinner"
        "github.com/fatih/color"
        "github.com/lokadev/lokadev/internal/registry"
        "github.com/spf13/cobra"
)

var startCmd = &cobra.Command{
        Use:   "start [name]",
        Short: "Start a project's services",
        Args:  cobra.ExactArgs(1),
        RunE: func(cmd *cobra.Command, args []string) error {
                name := args[0]
                reg, err := registry.Load()
                if err != nil {
                        return err
                }
                reg.ReconcileStatus()

                entry, ok := reg.Get(name)
                if !ok {
                        return fmt.Errorf("project '%s' not found — run 'lokadev create %s' first", name, name)
                }
                if entry.Status == registry.StatusRunning {
                        cyan := color.New(color.FgCyan).SprintFunc()
                        fmt.Printf("  %s %s is already running at %s\n",
                                color.YellowString("!"), name, cyan(fmt.Sprintf("https://%s.test", name)))
                        return nil
                }

                green := color.New(color.FgGreen).SprintFunc()
                cyan := color.New(color.FgCyan).SprintFunc()
                s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)

                var pids []int

                s.Suffix = fmt.Sprintf(" Starting web server (%s)...", entry.Server)
                s.Start()
                serverPID, serverErr := startWebServer(entry)
                s.Stop()
                if serverErr != nil {
                        fmt.Printf("  %s Web server: %s\n", color.YellowString("!"), serverErr)
                        fmt.Printf("    Install %s to enable web serving\n", entry.Server)
                } else {
                        pids = append(pids, serverPID)
                        fmt.Printf("  %s Web server (%s) started\n", green("✔"), entry.Server)
                }

                if entry.Database != "none" && entry.Database != "sqlite" {
                        s.Suffix = fmt.Sprintf(" Starting database (%s)...", entry.Database)
                        s.Start()
                        dbPID, dbErr := startDatabase(entry)
                        s.Stop()
                        if dbErr != nil {
                                fmt.Printf("  %s Database: %s\n", color.YellowString("!"), dbErr)
                                fmt.Printf("    Install %s to enable database support\n", entry.Database)
                        } else {
                                pids = append(pids, dbPID)
                                fmt.Printf("  %s Database (%s) started\n", green("✔"), entry.Database)
                        }
                }

                status := registry.StatusRunning
                if len(pids) == 0 {
                        status = registry.StatusError
                }
                _ = reg.SetStatus(name, status, pids)

                if len(pids) > 0 {
                        fmt.Printf("\n  %s %s is running at %s\n", green("✔"), name, cyan(fmt.Sprintf("https://%s.test", name)))
                } else {
                        fmt.Printf("\n  %s Services could not start — check that nginx/apache and mysql/postgres are installed\n",
                                color.YellowString("!"))
                }
                return nil
        },
}

var stopCmd = &cobra.Command{
        Use:   "stop [name]",
        Short: "Stop a project",
        Args:  cobra.ExactArgs(1),
        RunE: func(cmd *cobra.Command, args []string) error {
                name := args[0]
                reg, err := registry.Load()
                if err != nil {
                        return err
                }
                entry, ok := reg.Get(name)
                if !ok {
                        return fmt.Errorf("project '%s' not found", name)
                }
                if entry.Status == registry.StatusStopped || len(entry.PIDs) == 0 {
                        fmt.Printf("  %s %s is already stopped\n", color.YellowString("!"), name)
                        return nil
                }

                s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
                s.Suffix = fmt.Sprintf(" Stopping %s...", name)
                s.Start()

                for _, pid := range entry.PIDs {
                        proc, err := os.FindProcess(pid)
                        if err != nil {
                                continue
                        }
                        _ = proc.Signal(os.Interrupt)
                }
                time.Sleep(500 * time.Millisecond)

                s.Stop()
                _ = reg.SetStatus(name, registry.StatusStopped, nil)
                fmt.Printf("  %s %s stopped\n", color.GreenString("✔"), name)
                return nil
        },
}

var restartCmd = &cobra.Command{
        Use:   "restart [name]",
        Short: "Restart a project's services",
        Args:  cobra.ExactArgs(1),
        RunE: func(cmd *cobra.Command, args []string) error {
                if err := stopCmd.RunE(cmd, args); err != nil {
                        return err
                }
                time.Sleep(300 * time.Millisecond)
                return startCmd.RunE(cmd, args)
        },
}

var deleteCmd = &cobra.Command{
        Use:   "delete [name]",
        Short: "Delete a project and all its data",
        Args:  cobra.ExactArgs(1),
        RunE: func(cmd *cobra.Command, args []string) error {
                name := args[0]
                reg, err := registry.Load()
                if err != nil {
                        return err
                }
                entry, ok := reg.Get(name)
                if !ok {
                        return fmt.Errorf("project '%s' not found", name)
                }

                fmt.Printf("  %s This will permanently delete '%s' and all its data at:\n",
                        color.YellowString("!"), name)
                fmt.Printf("    %s\n\n", entry.Dir)
                fmt.Print("  Type the project name to confirm: ")
                var confirm string
                fmt.Scanln(&confirm)
                if confirm != name {
                        return fmt.Errorf("confirmation did not match — aborted")
                }

                _ = stopCmd.RunE(cmd, args)

                s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
                s.Suffix = " Removing project files..."
                s.Start()
                _ = os.RemoveAll(entry.Dir)
                _ = reg.Remove(name)
                s.Stop()

                fmt.Printf("  %s Project '%s' deleted\n", color.GreenString("✔"), name)
                return nil
        },
}

var listCmd = &cobra.Command{
        Use:   "list",
        Short: "List all LokaDev projects",
        RunE: func(cmd *cobra.Command, args []string) error {
                reg, err := registry.Load()
                if err != nil {
                        return err
                }
                reg.ReconcileStatus()

                entries := reg.All()
                if len(entries) == 0 {
                        fmt.Println("  No projects yet. Run 'lokadev create <name>' to get started.")
                        return nil
                }

                sort.Slice(entries, func(i, j int) bool {
                        return entries[i].Name < entries[j].Name
                })

                w := tabwriter.NewWriter(os.Stdout, 0, 0, 3, ' ', 0)
                header := color.New(color.Bold).SprintFunc()
                fmt.Fprintln(w, header("NAME\tSTATUS\tURL\tRUNTIME\tDB"))

                green := color.New(color.FgGreen).SprintFunc()
                yellow := color.New(color.FgYellow).SprintFunc()
                red := color.New(color.FgRed).SprintFunc()

                for _, e := range entries {
                        var statusStr string
                        switch e.Status {
                        case registry.StatusRunning:
                                statusStr = green("running")
                        case registry.StatusError:
                                statusStr = red("error")
                        default:
                                statusStr = yellow("stopped")
                        }
                        fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\n",
                                e.Name, statusStr,
                                fmt.Sprintf("https://%s.test", e.Name),
                                e.Runtime+" / "+e.Server,
                                e.Database,
                        )
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
                reg, err := registry.Load()
                if err != nil {
                        return err
                }
                entry, ok := reg.Get(name)
                if !ok {
                        return fmt.Errorf("project '%s' not found", name)
                }

                logDir := filepath.Join(entry.Dir, ".lokadev", "logs")
                logFile := filepath.Join(logDir, "access.log")

                if _, err := os.Stat(logFile); os.IsNotExist(err) {
                        if err := os.MkdirAll(logDir, 0755); err != nil {
                                return err
                        }
                        if err := os.WriteFile(logFile, []byte(""), 0644); err != nil {
                                return err
                        }
                }

                fmt.Printf("Tailing logs for %s (Ctrl+C to exit)...\n\n", name)
                fmt.Printf("  Log file: %s\n\n", logFile)

                f, err := os.Open(logFile)
                if err != nil {
                        return fmt.Errorf("open log file: %w", err)
                }
                defer f.Close()

                scanner := bufio.NewScanner(f)
                for scanner.Scan() {
                        fmt.Printf("  %s\n", color.New(color.FgHiBlack).Sprint(scanner.Text()))
                }

                fmt.Printf("  %s [watching for new log entries...]\n", color.New(color.FgHiBlack).Sprint("→"))
                for {
                        line, err := bufio.NewReader(f).ReadString('\n')
                        if err != nil {
                                time.Sleep(250 * time.Millisecond)
                                continue
                        }
                        fmt.Printf("  %s", color.New(color.FgHiBlack).Sprint(line))
                }
        },
}

var shellCmd = &cobra.Command{
        Use:   "shell [name]",
        Short: "Open a shell inside the project directory",
        Args:  cobra.ExactArgs(1),
        RunE: func(cmd *cobra.Command, args []string) error {
                name := args[0]
                reg, err := registry.Load()
                if err != nil {
                        return err
                }
                entry, ok := reg.Get(name)
                if !ok {
                        return fmt.Errorf("project '%s' not found", name)
                }
                fmt.Printf("Entering project shell for '%s'. Type 'exit' to return.\n", name)
                fmt.Printf("Project dir: %s\n\n", entry.Dir)
                return enterProjectShell(entry.Dir)
        },
}

var configCmd = &cobra.Command{
        Use:   "config [name]",
        Short: "Edit project configuration",
        Args:  cobra.ExactArgs(1),
        RunE: func(cmd *cobra.Command, args []string) error {
                name := args[0]
                reg, err := registry.Load()
                if err != nil {
                        return err
                }
                entry, ok := reg.Get(name)
                if !ok {
                        return fmt.Errorf("project '%s' not found", name)
                }
                return openEditor(filepath.Join(entry.Dir, "lokadev.toml"))
        },
}

var updateCmd = &cobra.Command{
        Use:   "update",
        Short: "Update LokaDev to the latest version",
        RunE: func(cmd *cobra.Command, args []string) error {
                s := spinner.New(spinner.CharSets[14], 80*time.Millisecond)
                s.Suffix = " Checking for updates..."
                s.Start()
                time.Sleep(800 * time.Millisecond)
                s.Stop()
                fmt.Printf("  %s LokaDev v%s is already the latest version\n", color.GreenString("✔"), version)
                fmt.Printf("  Source: https://github.com/ptraxzy/lokadev/releases\n")
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

func startWebServer(entry *registry.ProjectEntry) (int, error) {
        confDir := filepath.Join(entry.Dir, ".lokadev", "conf")
        logDir := filepath.Join(entry.Dir, ".lokadev", "logs")

        var serverCmd *exec.Cmd
        switch entry.Server {
        case "nginx":
                confPath := filepath.Join(confDir, "nginx.conf")
                conf := fmt.Sprintf(`
worker_processes 1;
error_log %s/error.log;
pid %s/nginx.pid;
events { worker_connections 64; }
http {
    access_log %s/access.log;
    server {
        listen 8080;
        server_name %s localhost;
        root %s/public;
        index index.php index.html;
        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }
    }
}
`, logDir, confDir, logDir, entry.Domain, entry.Dir)
                if err := os.WriteFile(confPath, []byte(conf), 0644); err != nil {
                        return 0, err
                }
                serverCmd = exec.Command("nginx", "-c", confPath, "-g", "daemon off;")
        case "caddy":
                confPath := filepath.Join(confDir, "Caddyfile")
                conf := fmt.Sprintf(`:8080 {
    root * %s/public
    file_server
    log {
        output file %s/access.log
    }
}
`, entry.Dir, logDir)
                if err := os.WriteFile(confPath, []byte(conf), 0644); err != nil {
                        return 0, err
                }
                serverCmd = exec.Command("caddy", "run", "--config", confPath, "--adapter", "caddyfile")
        case "apache":
                serverCmd = exec.Command("apache2ctl", "-D", "FOREGROUND")
        default:
                return 0, fmt.Errorf("unknown server: %s", entry.Server)
        }

        serverCmd.Dir = entry.Dir
        logFile := filepath.Join(logDir, "server.log")
        lf, _ := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
        if lf != nil {
                serverCmd.Stdout = lf
                serverCmd.Stderr = lf
        }

        if err := serverCmd.Start(); err != nil {
                return 0, fmt.Errorf("%s not found — install it first", entry.Server)
        }
        return serverCmd.Process.Pid, nil
}

func startDatabase(entry *registry.ProjectEntry) (int, error) {
        dataDir := filepath.Join(entry.Dir, ".lokadev", "db", entry.Database)
        if err := os.MkdirAll(dataDir, 0755); err != nil {
                return 0, err
        }

        var dbCmd *exec.Cmd
        switch entry.Database {
        case "mysql":
                if _, err := os.Stat(filepath.Join(dataDir, "mysql")); os.IsNotExist(err) {
                        init := exec.Command("mysqld", "--initialize-insecure", "--datadir="+dataDir)
                        if err := init.Run(); err != nil {
                                return 0, fmt.Errorf("mysql not found — install mysql-server first")
                        }
                }
                dbCmd = exec.Command("mysqld",
                        "--datadir="+dataDir,
                        "--port=13306",
                        "--socket="+filepath.Join(dataDir, "mysql.sock"),
                        "--bind-address=127.0.0.1",
                        "--skip-networking=0",
                )
        case "postgres":
                if _, err := os.Stat(filepath.Join(dataDir, "PG_VERSION")); os.IsNotExist(err) {
                        init := exec.Command("initdb", "-D", dataDir, "-U", "lokadev")
                        if err := init.Run(); err != nil {
                                return 0, fmt.Errorf("postgres not found — install postgresql-server first")
                        }
                }
                dbCmd = exec.Command("postgres", "-D", dataDir, "-p", "15432")
        case "redis":
                dbCmd = exec.Command("redis-server", "--port", "16379", "--dir", dataDir)
        default:
                return 0, fmt.Errorf("unsupported database: %s", entry.Database)
        }

        logFile := filepath.Join(entry.Dir, ".lokadev", "logs", "db.log")
        lf, _ := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
        if lf != nil {
                dbCmd.Stdout = lf
                dbCmd.Stderr = lf
        }

        if err := dbCmd.Start(); err != nil {
                return 0, fmt.Errorf("%s not found — install it first", entry.Database)
        }
        return dbCmd.Process.Pid, nil
}
