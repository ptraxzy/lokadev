package lokadev

import (
        "encoding/json"
        "fmt"
        "net/http"
        "os"
        "os/exec"
        "runtime"
        "strings"
        "time"

        "github.com/fatih/color"
        "github.com/lokadev/lokadev/internal/registry"
)

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

func enterProjectShell(dir string) error {
        shell := os.Getenv("SHELL")
        if shell == "" {
                switch runtime.GOOS {
                case "windows":
                        shell = "cmd.exe"
                default:
                        shell = "/bin/bash"
                }
        }
        cmd := exec.Command(shell)
        cmd.Dir = dir
        cmd.Stdin = os.Stdin
        cmd.Stdout = os.Stdout
        cmd.Stderr = os.Stderr
        return cmd.Run()
}

func enterDBShell(project string) error {
        cmd := exec.Command("mysql",
                "--socket="+project+"/mysql.sock",
                "-u", "root")
        cmd.Stdin = os.Stdin
        cmd.Stdout = os.Stdout
        cmd.Stderr = os.Stderr
        return cmd.Run()
}

func dumpDatabase(project string) error {
        cmd := exec.Command("mysqldump",
                "--socket="+project+"/mysql.sock",
                "-u", "root", "--all-databases")
        cmd.Stdout = os.Stdout
        cmd.Stderr = os.Stderr
        return cmd.Run()
}

func restoreDatabase(project string) error {
        cmd := exec.Command("mysql",
                "--socket="+project+"/mysql.sock",
                "-u", "root")
        cmd.Stdin = os.Stdin
        cmd.Stdout = os.Stdout
        cmd.Stderr = os.Stderr
        return cmd.Run()
}

func corsHeaders(w http.ResponseWriter) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func startDaemon() error {
        port := 25000
        cyan := color.New(color.FgCyan).SprintFunc()

        mux := http.NewServeMux()

        // GET /api/projects — list all projects with status
        mux.HandleFunc("/api/projects", func(w http.ResponseWriter, r *http.Request) {
                corsHeaders(w)
                if r.Method == http.MethodOptions {
                        w.WriteHeader(http.StatusNoContent)
                        return
                }
                reg, err := registry.Load()
                if err != nil {
                        http.Error(w, err.Error(), http.StatusInternalServerError)
                        return
                }
                reg.ReconcileStatus()
                w.Header().Set("Content-Type", "application/json")
                json.NewEncoder(w).Encode(reg.All())
        })

        // POST /api/projects/{name}/start
        mux.HandleFunc("/api/projects/", func(w http.ResponseWriter, r *http.Request) {
                corsHeaders(w)
                if r.Method == http.MethodOptions {
                        w.WriteHeader(http.StatusNoContent)
                        return
                }
                // parse /api/projects/{name}/{action}
                parts := splitPath(r.URL.Path)
                // parts: ["api", "projects", name, action]
                if len(parts) < 4 {
                        http.Error(w, "invalid path", http.StatusBadRequest)
                        return
                }
                name := parts[2]
                action := parts[3]

                reg, err := registry.Load()
                if err != nil {
                        http.Error(w, err.Error(), http.StatusInternalServerError)
                        return
                }
                reg.ReconcileStatus()
                entry, ok := reg.Get(name)
                if !ok {
                        http.Error(w, "project not found", http.StatusNotFound)
                        return
                }

                w.Header().Set("Content-Type", "application/json")

                switch action {
                case "start":
                        if entry.Status == registry.StatusRunning {
                                json.NewEncoder(w).Encode(map[string]string{"status": "already_running"})
                                return
                        }
                        var pids []int
                        serverPID, serverErr := startWebServer(entry)
                        if serverErr == nil {
                                pids = append(pids, serverPID)
                        }
                        if entry.Database != "none" && entry.Database != "sqlite" {
                                dbPID, dbErr := startDatabase(entry)
                                if dbErr == nil {
                                        pids = append(pids, dbPID)
                                }
                        }
                        st := registry.StatusRunning
                        if len(pids) == 0 {
                                st = registry.StatusError
                        }
                        _ = reg.SetStatus(name, st, pids)
                        json.NewEncoder(w).Encode(map[string]string{"status": string(st)})

                case "stop":
                        for _, pid := range entry.PIDs {
                                proc, err := os.FindProcess(pid)
                                if err == nil {
                                        _ = proc.Signal(os.Interrupt)
                                }
                        }
                        time.Sleep(400 * time.Millisecond)
                        _ = reg.SetStatus(name, registry.StatusStopped, nil)
                        json.NewEncoder(w).Encode(map[string]string{"status": "stopped"})

                case "restart":
                        for _, pid := range entry.PIDs {
                                proc, err := os.FindProcess(pid)
                                if err == nil {
                                        _ = proc.Signal(os.Interrupt)
                                }
                        }
                        time.Sleep(400 * time.Millisecond)
                        _ = reg.SetStatus(name, registry.StatusStopped, nil)
                        var pids []int
                        serverPID, serverErr := startWebServer(entry)
                        if serverErr == nil {
                                pids = append(pids, serverPID)
                        }
                        if entry.Database != "none" && entry.Database != "sqlite" {
                                dbPID, dbErr := startDatabase(entry)
                                if dbErr == nil {
                                        pids = append(pids, dbPID)
                                }
                        }
                        st := registry.StatusRunning
                        if len(pids) == 0 {
                                st = registry.StatusError
                        }
                        _ = reg.SetStatus(name, st, pids)
                        json.NewEncoder(w).Encode(map[string]string{"status": string(st)})

                default:
                        http.Error(w, "unknown action", http.StatusBadRequest)
                }
        })

        // GET /api/status — daemon health
        mux.HandleFunc("/api/status", func(w http.ResponseWriter, r *http.Request) {
                corsHeaders(w)
                w.Header().Set("Content-Type", "application/json")
                json.NewEncoder(w).Encode(map[string]string{
                        "version": version,
                        "status":  "running",
                        "time":    time.Now().Format(time.RFC3339),
                })
        })

        mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
                w.Header().Set("Content-Type", "text/html")
                fmt.Fprintf(w, `<!doctype html>
<html>
<head><title>LokaDev Dashboard</title>
<style>
body{font-family:monospace;background:#0a0a0a;color:#e2e8f0;padding:40px;max-width:900px;margin:0 auto}
h1{color:#22d3ee;font-size:2rem;margin-bottom:8px}
p{color:#64748b;margin-bottom:32px}
a{color:#22d3ee;text-decoration:none}
</style>
</head>
<body>
<h1>&gt;_ LokaDev v%s</h1>
<p>Dashboard is running. Use the CLI to manage projects.</p>
<p>API: <a href="/api/projects">/api/projects</a> &nbsp;|&nbsp; <a href="/api/status">/api/status</a></p>
</body>
</html>`, version)
        })

        addr := fmt.Sprintf("127.0.0.1:%d", port)
        fmt.Printf("\n  %s LokaDev daemon started\n", color.GreenString("✔"))
        fmt.Printf("  Dashboard: %s\n", cyan(fmt.Sprintf("http://localhost:%d", port)))
        fmt.Printf("  API:       %s\n\n", cyan(fmt.Sprintf("http://localhost:%d/api/projects", port)))
        fmt.Printf("  Press Ctrl+C to stop.\n\n")

        srv := &http.Server{Addr: addr, Handler: mux}
        return srv.ListenAndServe()
}

// splitPath splits a URL path like "/api/projects/foo/start" into
// ["api", "projects", "foo", "start"], stripping leading slash.
func splitPath(path string) []string {
        var parts []string
        for _, p := range strings.Split(strings.TrimPrefix(path, "/"), "/") {
                if p != "" {
                        parts = append(parts, p)
                }
        }
        return parts
}
