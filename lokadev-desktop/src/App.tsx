import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Folder, Server, ScrollText, Settings2, Minus, Maximize2, X,
  Play, Square, RotateCcw, Plus, Trash2, ExternalLink, Search,
  RefreshCw, ChevronDown, LayoutGrid, Sun, Moon, Terminal,
  AlertCircle, Loader2, type LucideIcon,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type ProjectStatus = "running" | "stopped" | "error";

interface Project {
  name: string; dir: string; domain: string;
  runtime: string; server: string; database: string;
  status: ProjectStatus; pids: number[];
}

interface ServiceInfo {
  name: string; version: string; port: number; status: string;
}

interface LogEntry { t: string; l: string; m: string; }

interface AppSettings {
  start_at_login: boolean;
  minimize_to_tray: boolean;
  show_notifications: boolean;
  daemon_port: string;
  projects_dir: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const L = {
  // Light
  bg:       "bg-[#F8F6F2]",
  sidebar:  "bg-[#F0EDE8]",
  surface:  "bg-white",
  hover:    "hover:bg-[#EDE9E3]",
  border:   "border-[#E0DDD7]",
  text:     "text-[#1A1815]",
  muted:    "text-[#6E6B65]",
  dim:      "text-[#ABA7A0]",
  // Dark overrides
  dbg:      "dark:bg-[#1A1917]",
  dsidebar: "dark:bg-[#141311]",
  dsurface: "dark:bg-[#222120]",
  dhover:   "dark:hover:bg-[#2C2A28]",
  dborder:  "dark:border-[#333028]",
  dtext:    "dark:text-[#EDE9E3]",
  dmuted:   "dark:text-[#8A8780]",
  ddim:     "dark:text-[#4A4845]",
};

const c = (...parts: string[]) => parts.join(" ");

// ── Titlebar ───────────────────────────────────────────────────────────────────

function Titlebar({ dark, onToggleDark, daemonOk }: {
  dark: boolean; onToggleDark: () => void; daemonOk: boolean;
}) {
  const win = getCurrentWindow();
  return (
    <div data-tauri-drag-region
      className={c("flex items-center h-10 px-4 shrink-0 border-b select-none",
        L.sidebar, L.dsidebar, L.border, L.dborder)}>
      <div className="flex items-center gap-2.5" data-tauri-drag-region>
        <span className={c("text-[13px] font-semibold", L.text, L.dtext)}>LokaDev</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
          daemonOk
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
            : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
        }`}>
          {daemonOk ? "active" : "offline"}
        </span>
      </div>
      <div className="flex-1" data-tauri-drag-region />
      <div className="flex items-center gap-1">
        <button onClick={onToggleDark}
          className={c("w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
            L.hover, L.dhover, L.muted, L.dmuted)}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <div className={c("w-px h-4 mx-1", "bg-[#E0DDD7] dark:bg-[#333028]")} />
        <button onClick={() => win.minimize()}
          className={c("w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
            L.hover, L.dhover, L.muted, L.dmuted)}>
          <Minus size={13} />
        </button>
        <button onClick={() => win.toggleMaximize()}
          className={c("w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
            L.hover, L.dhover, L.muted, L.dmuted)}>
          <Maximize2 size={12} />
        </button>
        <button onClick={() => win.hide()}
          className={c("w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400",
            L.muted, L.dmuted)}>
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Daemon Offline Screen ──────────────────────────────────────────────────────

function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  const [starting, setStarting] = useState(false);
  const [msg, setMsg] = useState("");

  const startDaemon = async () => {
    setStarting(true);
    setMsg("Starting daemon…");
    try {
      await invoke("start_daemon");
      setMsg("Daemon started, connecting…");
      await new Promise(r => setTimeout(r, 2000));
      onRetry();
    } catch (e) {
      setMsg(`Failed: ${e}`);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className={c("flex-1 flex items-center justify-center", L.bg, L.dbg)}>
      <div className="text-center max-w-sm fade-up">
        <div className={c("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5",
          "bg-[#F0EDE8] dark:bg-[#222120] border", L.border, L.dborder)}>
          <AlertCircle size={26} className="text-[#ABA7A0] dark:text-[#4A4845]" />
        </div>
        <h2 className={c("text-[16px] font-semibold mb-2", L.text, L.dtext)}>
          Daemon not running
        </h2>
        <p className={c("text-sm mb-6 leading-relaxed", L.muted, L.dmuted)}>
          LokaDev daemon needs to be running on port 25000 for the app to function.
        </p>
        <button onClick={startDaemon} disabled={starting}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium bg-[#1A1815] text-white dark:bg-[#EDE9E3] dark:text-[#1A1815] hover:opacity-90 disabled:opacity-50 transition-all mb-4">
          {starting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {starting ? "Starting…" : "Start Daemon"}
        </button>
        {msg && <p className={c("text-xs mb-4", L.muted, L.dmuted)}>{msg}</p>}
        <div className={c("text-xs rounded-xl px-4 py-3 text-left font-mono border", L.surface, L.dsurface, L.border, L.dborder)}>
          <p className={c("mb-1", L.dim, L.ddim)}>Or run manually in terminal:</p>
          <p className={c(L.muted, L.dmuted)}>lokadev daemon</p>
        </div>
        <button onClick={onRetry}
          className={c("mt-4 text-xs flex items-center gap-1.5 mx-auto transition-colors", L.dim, L.ddim, "hover:text-[#6E6B65] dark:hover:text-[#8A8780]")}>
          <RefreshCw size={11} /> Retry connection
        </button>
      </div>
    </div>
  );
}

// ── New Project Modal ──────────────────────────────────────────────────────────

function NewProjectModal({ onClose, onCreated }: {
  onClose: () => void; onCreated: () => void;
}) {
  const [name, setName]       = useState("");
  const [runtime, setRuntime] = useState("php8.3");
  const [server, setServer]   = useState("nginx");
  const [db, setDb]           = useState("mysql");
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = async () => {
    const n = name.trim();
    if (!n) return setErr("Project name is required");
    if (!/^[a-z0-9_-]+$/.test(n)) return setErr("Use lowercase letters, numbers, - or _");
    setBusy(true); setErr("");
    try {
      await invoke("run_lokadev", {
        args: ["create", n, "--runtime", runtime, "--server", server, "--db", db, "--yes"],
      });
      onCreated(); onClose();
    } catch {
      try {
        await invoke("run_lokadev", { args: ["create", n] });
        onCreated(); onClose();
      } catch (e2) { setErr(String(e2)); }
    } finally { setBusy(false); }
  };

  const Select = ({ label, value, set, opts }: {
    label: string; value: string; set: (v: string) => void; opts: string[];
  }) => (
    <div>
      <label className={c("text-xs block mb-1.5 font-medium", L.muted, L.dmuted)}>{label}</label>
      <div className="relative">
        <select value={value} onChange={e => set(e.target.value)}
          className={c("w-full appearance-none rounded-xl px-3 py-2 text-[13px] pr-7 outline-none cursor-pointer border transition-colors",
            L.surface, L.dsurface, L.border, L.dborder, L.text, L.dtext,
            "focus:border-[#C8C2BA] dark:focus:border-[#4A4845]")}>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className={c("absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none", L.dim, L.ddim)} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 dark:bg-black/40"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={c("w-[440px] rounded-2xl border shadow-xl fade-up", L.surface, L.dsurface, L.border, L.dborder)}>
        <div className="px-6 pt-6 pb-5">
          <h3 className={c("text-[15px] font-semibold mb-5", L.text, L.dtext)}>New Project</h3>
          <div className="space-y-4">
            <div>
              <label className={c("text-xs block mb-1.5 font-medium", L.muted, L.dmuted)}>Project name</label>
              <input ref={ref} value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="my-project"
                className={c("w-full rounded-xl px-3 py-2.5 text-[13px] border outline-none transition-colors",
                  L.bg, L.dbg, L.border, L.dborder, L.text, L.dtext,
                  "placeholder:text-[#ABA7A0] dark:placeholder:text-[#4A4845]",
                  "focus:border-[#C8C2BA] dark:focus:border-[#4A4845]")}
                style={{ WebkitUserSelect: "text", userSelect: "text" }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Select label="Runtime"  value={runtime} set={setRuntime} opts={["php8.3","php8.2","php8.1","node20","node18","python3","go","static"]} />
              <Select label="Server"   value={server}  set={setServer}  opts={["nginx","apache","caddy"]} />
              <Select label="Database" value={db}      set={setDb}      opts={["mysql","postgresql","sqlite","none"]} />
            </div>
            {err && <p className="text-[13px] text-red-500 dark:text-red-400">{err}</p>}
          </div>
        </div>
        <div className={c("flex items-center justify-end gap-2 px-6 py-4 border-t", L.border, L.dborder)}>
          <button onClick={onClose} disabled={busy}
            className={c("text-[13px] px-4 py-2 rounded-xl transition-colors", L.muted, L.dmuted, L.hover, L.dhover)}>
            Cancel
          </button>
          <button onClick={submit} disabled={busy || !name.trim()}
            className="text-[13px] px-5 py-2 rounded-xl font-medium bg-[#1A1815] text-white dark:bg-[#EDE9E3] dark:text-[#1A1815] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {busy ? "Creating…" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProjectStatus | string }) {
  if (status === "running")
    return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />Running</span>;
  if (status === "error")
    return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Error</span>;
  return <span className={c("text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F0EDE8] dark:bg-[#2C2A28] flex items-center gap-1.5", L.muted, L.dmuted)}><span className="w-1.5 h-1.5 rounded-full bg-[#D0CCC5] dark:bg-[#4A4845]" />Stopped</span>;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [daemonOk, setDaemonOk] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await invoke<Project[]>("list_projects");
      setProjects(r); setDaemonOk(true);
    } catch {
      setProjects([]); setDaemonOk(false);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  const runCmd = async (cmd: string, name: string) => {
    try { await invoke("run_lokadev", { args: [cmd, name] }); setTimeout(refresh, 800); }
    catch (e) { console.error(e); }
  };

  return { projects, loading, daemonOk, refresh, runCmd };
}

function useServices() {
  const FALLBACK: ServiceInfo[] = [
    { name: "Nginx",      version: "1.25.3", port: 80,   status: "stopped" },
    { name: "MySQL",      version: "8.0.36", port: 3306, status: "stopped" },
    { name: "PostgreSQL", version: "16.2",   port: 5432, status: "stopped" },
    { name: "Redis",      version: "7.2.4",  port: 6379, status: "stopped" },
  ];
  const [services, setServices] = useState<ServiceInfo[]>(FALLBACK);
  const [busy, setBusy]         = useState<string | null>(null);

  useEffect(() => {
    invoke<ServiceInfo[]>("list_services")
      .then(r => { if (r.length) setServices(r); })
      .catch(() => {});
  }, []);

  const toggle = async (svc: ServiceInfo) => {
    const action = svc.status === "running" ? "stop" : "start";
    setBusy(svc.name);
    try {
      await invoke("control_service", { name: svc.name, action });
    } catch { /* optimistic */ }
    setServices(prev => prev.map(s =>
      s.name === svc.name ? { ...s, status: action === "start" ? "running" : "stopped" } : s
    ));
    setBusy(null);
  };

  return { services, busy, toggle };
}

function useLogs() {
  const [logs, setLogs]     = useState<LogEntry[]>([]);
  const [source, setSource] = useState("daemon");
  const endRef              = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const r = await invoke<LogEntry[]>("get_logs", { project: source === "daemon" ? null : source });
      if (r.length) setLogs(r);
    } catch {}
  }, [source]);

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 2500);
    return () => clearInterval(id);
  }, [fetchLogs]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return { logs, source, setSource, endRef, fetchLogs };
}

function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    start_at_login: false, minimize_to_tray: true,
    show_notifications: false, daemon_port: "25000", projects_dir: "~/lokadev-projects",
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    invoke<AppSettings>("load_settings").then(s => setSettings(s)).catch(() => {});
  }, []);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() =>
      invoke("save_settings", { settings: next }).catch(() => {}), 600);
  };

  return { settings, update };
}

// ── Toggle component ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={checked}
      className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-[#1A1815] dark:bg-[#EDE9E3]" : "bg-[#D0CCC5] dark:bg-[#333028]"
      }`}>
      <span className={`absolute top-[3px] w-4 h-4 rounded-full transition-all ${
        checked
          ? "left-[22px] bg-white dark:bg-[#1A1815]"
          : "left-[3px] bg-white dark:bg-[#8A8780]"
      }`} />
    </button>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────

type Tab = "projects" | "services" | "logs" | "settings";

const NAV: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: "projects", label: "Projects", Icon: Folder },
  { id: "services", label: "Services", Icon: Server },
  { id: "logs",     label: "Logs",     Icon: ScrollText },
  { id: "settings", label: "Settings", Icon: Settings2 },
];

const LOG_COLORS: Record<string, string> = {
  INFO: "#3B82F6", OK: "#10B981", WARN: "#F59E0B", ERROR: "#EF4444", DEBUG: "#6B7280",
};

export default function App() {
  const [dark, setDark]         = useState(false);
  const [tab, setTab]           = useState<Tab>("projects");
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [showNew, setShowNew]   = useState(false);

  const { projects, loading, daemonOk, refresh, runCmd } = useProjects();
  const { services, busy: svcBusy, toggle: toggleSvc }   = useServices();
  const { logs, source, setSource, endRef, fetchLogs }   = useLogs();
  const { settings, update: updateSettings }             = useSettings();

  const filtered        = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const selectedProject = projects.find(p => p.name === selected);
  const runningCount    = projects.filter(p => p.status === "running").length;

  return (
    <div className={c("flex flex-col h-screen font-sans text-[14px] antialiased", dark ? "dark" : "")}>
      <div className={c("flex flex-col h-full", L.bg, L.dbg, L.text, L.dtext)}>
        <Titlebar dark={dark} onToggleDark={() => setDark(d => !d)} daemonOk={daemonOk} />

        {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={refresh} />}

        <div className="flex flex-1 min-h-0">

          {/* ── Sidebar ── */}
          <aside className={c("w-52 shrink-0 flex flex-col border-r", L.sidebar, L.dsidebar, L.border, L.dborder)}>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    tab === id
                      ? "bg-[#1A1815] text-white dark:bg-[#EDE9E3] dark:text-[#1A1815]"
                      : c(L.muted, L.dmuted, "hover:bg-[#E8E4DE] dark:hover:bg-[#2C2A28]")
                  }`}>
                  <Icon size={15} strokeWidth={tab === id ? 2.2 : 1.8} />
                  {label}
                </button>
              ))}
            </nav>

            <div className={c("border-t p-3 space-y-1", L.border, L.dborder)}>
              <div className={c("flex justify-between text-xs px-1 mb-2", L.dim, L.ddim)}>
                <span>{runningCount} running</span>
                <span>{projects.length} projects</span>
              </div>
              <button onClick={() => open("http://localhost:25000")}
                className={c("flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px] transition-colors",
                  L.muted, L.dmuted, "hover:bg-[#E8E4DE] dark:hover:bg-[#2C2A28]")}>
                <ExternalLink size={13} /> Dashboard
              </button>
            </div>
          </aside>

          {/* ── Main content ── */}
          {!daemonOk && !loading ? (
            <OfflineScreen onRetry={refresh} />
          ) : (
            <main className="flex-1 flex flex-col min-w-0 min-h-0">

              {/* PROJECTS */}
              {tab === "projects" && (
                <div className="flex flex-1 min-h-0">

                  {/* List panel */}
                  <div className={c("w-64 shrink-0 flex flex-col border-r", L.border, L.dborder)}>
                    <div className={c("flex items-center gap-2 p-3 border-b", L.border, L.dborder)}>
                      <div className={c("flex items-center flex-1 rounded-xl px-3 py-2 gap-2 border",
                        L.surface, L.dsurface, L.border, L.dborder)}>
                        <Search size={13} className={c(L.dim, L.ddim)} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                          placeholder="Search projects…"
                          className={c("bg-transparent flex-1 text-[13px] outline-none", L.text, L.dtext,
                            "placeholder:text-[#ABA7A0] dark:placeholder:text-[#4A4845]")}
                          style={{ WebkitUserSelect: "text", userSelect: "text" }}
                        />
                      </div>
                      <button onClick={refresh}
                        className={c("p-2 rounded-xl transition-colors", L.hover, L.dhover, L.dim, L.ddim)}>
                        <RefreshCw size={13} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {loading ? (
                        <div className="flex items-center justify-center h-24 gap-2">
                          <Loader2 size={16} className={c("animate-spin", L.dim, L.ddim)} />
                          <span className={c("text-sm", L.dim, L.ddim)}>Loading…</span>
                        </div>
                      ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
                          <LayoutGrid size={28} className={c(L.dim, L.ddim)} />
                          <p className={c("text-sm", L.dim, L.ddim)}>
                            {search ? "No matches found" : "No projects yet"}
                          </p>
                          {!search && (
                            <button onClick={() => setShowNew(true)}
                              className={c("text-[13px] px-4 py-2 rounded-xl border transition-colors",
                                L.muted, L.dmuted, L.border, L.dborder, L.hover, L.dhover)}>
                              Create your first project
                            </button>
                          )}
                        </div>
                      ) : (
                        filtered.map(p => (
                          <button key={p.name} onClick={() => setSelected(p.name)}
                            className={`w-full text-left px-4 py-3 border-b transition-colors border-l-2 ${
                              selected === p.name
                                ? c("bg-[#EDE9E3] dark:bg-[#2C2A28]", "border-l-[#1A1815] dark:border-l-[#EDE9E3]", L.border, L.dborder)
                                : c(L.hover, L.dhover, "border-l-transparent", L.border, L.dborder)
                            }`}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={c("text-[13px] font-medium truncate", L.text, L.dtext)}>{p.name}</span>
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                p.status === "running" ? "bg-emerald-500 pulse-dot" :
                                p.status === "error" ? "bg-red-500" : "bg-[#D0CCC5] dark:bg-[#4A4845]"
                              }`} />
                            </div>
                            <p className={c("text-[12px]", L.dim, L.ddim)}>{p.runtime} · {p.server}</p>
                          </button>
                        ))
                      )}
                    </div>

                    <div className={c("p-3 border-t", L.border, L.dborder)}>
                      <button onClick={() => setShowNew(true)}
                        className={c("flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] border transition-all",
                          L.muted, L.dmuted, L.border, L.dborder, L.hover, L.dhover)}>
                        <Plus size={14} /> New Project
                      </button>
                    </div>
                  </div>

                  {/* Detail panel */}
                  <div className="flex-1 overflow-y-auto">
                    {!selectedProject ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Terminal size={32} className={c(L.dim, L.ddim)} />
                        <p className={c("text-sm", L.dim, L.ddim)}>Select a project to view details</p>
                      </div>
                    ) : (
                      <div className="p-6 space-y-5 fade-up">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-1.5">
                              <h2 className={c("text-[17px] font-semibold", L.text, L.dtext)}>{selectedProject.name}</h2>
                              <StatusBadge status={selectedProject.status} />
                            </div>
                            <button onClick={() => open(`http://${selectedProject.domain}`)}
                              className={c("flex items-center gap-1.5 text-[13px] transition-colors", L.muted, L.dmuted, "hover:text-[#1A1815] dark:hover:text-[#EDE9E3]")}>
                              {selectedProject.domain} <ExternalLink size={11} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedProject.status === "running" ? (
                              <button onClick={() => runCmd("stop", selectedProject.name)}
                                className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/40 transition-all">
                                <Square size={13} /> Stop
                              </button>
                            ) : (
                              <button onClick={() => runCmd("start", selectedProject.name)}
                                className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-xl font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/40 transition-all">
                                <Play size={13} /> Start
                              </button>
                            )}
                            <button onClick={() => runCmd("restart", selectedProject.name)}
                              className={c("flex items-center gap-2 text-[13px] px-4 py-2 rounded-xl border transition-all",
                                L.muted, L.dmuted, L.border, L.dborder, L.hover, L.dhover)}>
                              <RotateCcw size={13} /> Restart
                            </button>
                          </div>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Runtime",    value: selectedProject.runtime },
                            { label: "Web Server", value: selectedProject.server },
                            { label: "Database",   value: selectedProject.database },
                            { label: "Domain",     value: selectedProject.domain },
                            { label: "Directory",  value: selectedProject.dir, full: true },
                          ].map(({ label, value, full }) => (
                            <div key={label} className={c("rounded-xl p-4 border", full ? "col-span-2" : "",
                              L.surface, L.dsurface, L.border, L.dborder)}>
                              <p className={c("text-[11px] uppercase tracking-wider font-medium mb-1.5", L.dim, L.ddim)}>{label}</p>
                              <p className={c("text-[13px] font-mono truncate", L.text, L.dtext)}>{value || "—"}</p>
                            </div>
                          ))}
                        </div>

                        {/* Config */}
                        <div>
                          <p className={c("text-xs uppercase tracking-wider font-medium mb-2", L.dim, L.ddim)}>lokadev.toml</p>
                          <pre className={c("rounded-xl border p-4 text-[12px] leading-relaxed font-mono overflow-x-auto",
                            L.surface, L.dsurface, L.border, L.dborder, L.muted, L.dmuted)}>
{`[project]
name     = "${selectedProject.name}"
domain   = "${selectedProject.domain}"

[server]
type = "${selectedProject.server}"

[database]
type = "${selectedProject.database}"`}
                          </pre>
                        </div>

                        {/* Danger */}
                        <div className={c("rounded-xl border p-4", "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10")}>
                          <p className="text-xs uppercase tracking-wider font-medium text-red-400 dark:text-red-500 mb-3">Danger Zone</p>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${selectedProject.name}"? This cannot be undone.`)) {
                                runCmd("delete", selectedProject.name);
                                setSelected(null);
                              }
                            }}
                            className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/40 transition-all">
                            <Trash2 size={13} /> Delete Project
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SERVICES */}
              {tab === "services" && (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    <h2 className={c("text-[15px] font-semibold", L.text, L.dtext)}>Services</h2>
                    <p className={c("text-sm mt-1", L.muted, L.dmuted)}>Global services shared across all projects</p>
                  </div>
                  <div className="space-y-2 max-w-2xl">
                    {services.map(svc => (
                      <div key={svc.name}
                        className={c("flex items-center gap-4 px-5 py-4 rounded-xl border transition-all",
                          L.surface, L.dsurface, L.border, L.dborder, "hover:border-[#C8C2BA] dark:hover:border-[#4A4845]")}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          svc.status === "running" ? "bg-emerald-500 pulse-dot" : "bg-[#D0CCC5] dark:bg-[#4A4845]"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className={c("text-[13px] font-medium", L.text, L.dtext)}>{svc.name}</span>
                            <span className={c("text-xs font-mono", L.dim, L.ddim)}>v{svc.version}</span>
                          </div>
                          <span className={c("text-xs font-mono", L.dim, L.ddim)}>:{svc.port}</span>
                        </div>
                        <span className={`text-[13px] w-16 text-right ${
                          svc.status === "running" ? "text-emerald-600 dark:text-emerald-400" : c(L.dim, L.ddim)
                        }`}>{svc.status}</span>
                        <button onClick={() => toggleSvc(svc)} disabled={svcBusy === svc.name}
                          className={`p-2 rounded-lg transition-all disabled:opacity-40 ${
                            svc.status === "running"
                              ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          }`}>
                          {svcBusy === svc.name
                            ? <Loader2 size={14} className="animate-spin" />
                            : svc.status === "running" ? <Square size={14} /> : <Play size={14} />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LOGS */}
              {tab === "logs" && (
                <div className="flex-1 flex flex-col min-h-0 p-5">
                  <div className="flex items-center gap-3 mb-4 shrink-0">
                    <div className="relative">
                      <select value={source} onChange={e => setSource(e.target.value)}
                        className={c("appearance-none rounded-xl px-3 py-2 text-[13px] pr-7 border outline-none cursor-pointer",
                          L.surface, L.dsurface, L.border, L.dborder, L.muted, L.dmuted)}>
                        <option value="daemon">daemon</option>
                        {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                      <ChevronDown size={12} className={c("absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none", L.dim, L.ddim)} />
                    </div>
                    <button onClick={fetchLogs}
                      className={c("p-2 rounded-xl transition-colors", L.hover, L.dhover, L.dim, L.ddim)}>
                      <RefreshCw size={13} />
                    </button>
                    <span className={c("text-xs ml-auto font-mono", L.dim, L.ddim)}>{logs.length} lines</span>
                  </div>
                  <div className={c("flex-1 rounded-xl border p-4 overflow-y-auto font-mono text-[12px] leading-relaxed",
                    L.surface, L.dsurface, L.border, L.dborder)}>
                    {logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <ScrollText size={24} className={c(L.dim, L.ddim)} />
                        <p className={c("text-sm", L.dim, L.ddim)}>No logs — start the daemon first</p>
                        <code className={c("text-xs border rounded-lg px-3 py-1.5", L.border, L.dborder, L.muted, L.dmuted)}>lokadev daemon</code>
                      </div>
                    ) : (
                      <>
                        {logs.map((row, i) => (
                          <div key={i} className={c("flex gap-3 rounded px-2 py-0.5", "hover:bg-[#F3F1ED] dark:hover:bg-[#2C2A28]")}>
                            <span className={c("shrink-0 w-16 tabular-nums", L.dim, L.ddim)}>{row.t}</span>
                            <span className="shrink-0 w-10 font-medium" style={{ color: LOG_COLORS[row.l] ?? "#6B7280" }}>{row.l}</span>
                            <span className={c(L.muted, L.dmuted)}>{row.m}</span>
                          </div>
                        ))}
                        <div ref={endRef} />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* SETTINGS */}
              {tab === "settings" && (
                <div className="flex-1 overflow-y-auto p-6">
                  <h2 className={c("text-[15px] font-semibold mb-6", L.text, L.dtext)}>Settings</h2>
                  <div className="space-y-6 max-w-lg">

                    {/* General */}
                    <div>
                      <p className={c("text-xs uppercase tracking-wider font-medium mb-2 px-1", L.dim, L.ddim)}>General</p>
                      <div className={c("rounded-2xl border divide-y overflow-hidden", L.border, L.dborder, "divide-[#E0DDD7] dark:divide-[#333028]")}>
                        {([
                          { key: "start_at_login",     label: "Start at login",     desc: "Launch daemon on system startup" },
                          { key: "minimize_to_tray",    label: "Minimize to tray",   desc: "Hide window instead of closing" },
                          { key: "show_notifications",  label: "Notifications",      desc: "Alert when projects start or stop" },
                        ] as const).map(({ key, label, desc }) => (
                          <div key={key} className={c("flex items-center justify-between gap-4 px-5 py-4", L.surface, L.dsurface)}>
                            <div>
                              <p className={c("text-[13px] font-medium", L.text, L.dtext)}>{label}</p>
                              <p className={c("text-[12px] mt-0.5", L.muted, L.dmuted)}>{desc}</p>
                            </div>
                            <Toggle checked={settings[key]} onChange={() => updateSettings({ [key]: !settings[key] })} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Daemon */}
                    <div>
                      <p className={c("text-xs uppercase tracking-wider font-medium mb-2 px-1", L.dim, L.ddim)}>Daemon</p>
                      <div className={c("rounded-2xl border divide-y overflow-hidden", L.border, L.dborder, "divide-[#E0DDD7] dark:divide-[#333028]")}>
                        {([
                          { key: "daemon_port",   label: "Port",              placeholder: "25000" },
                          { key: "projects_dir",  label: "Projects directory", placeholder: "~/lokadev-projects" },
                        ] as const).map(({ key, label, placeholder }) => (
                          <div key={key} className={c("flex items-center justify-between gap-4 px-5 py-4", L.surface, L.dsurface)}>
                            <p className={c("text-[13px] font-medium", L.text, L.dtext)}>{label}</p>
                            <input value={settings[key]}
                              onChange={e => updateSettings({ [key]: e.target.value })}
                              placeholder={placeholder}
                              className={c("rounded-xl border px-3 py-1.5 text-[12px] font-mono outline-none text-right w-48 transition-colors",
                                L.bg, L.dbg, L.border, L.dborder, L.muted, L.dmuted,
                                "focus:border-[#C8C2BA] dark:focus:border-[#4A4845]")}
                              style={{ WebkitUserSelect: "text", userSelect: "text" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* About */}
                    <div>
                      <p className={c("text-xs uppercase tracking-wider font-medium mb-2 px-1", L.dim, L.ddim)}>About</p>
                      <div className={c("rounded-2xl border divide-y overflow-hidden", L.border, L.dborder, "divide-[#E0DDD7] dark:divide-[#333028]")}>
                        <div className={c("flex items-center justify-between px-5 py-4", L.surface, L.dsurface)}>
                          <p className={c("text-[13px] font-medium", L.text, L.dtext)}>Version</p>
                          <p className={c("text-[13px] font-mono", L.muted, L.dmuted)}>v1.0.4</p>
                        </div>
                        <div className={c("flex items-center justify-between px-5 py-4", L.surface, L.dsurface)}>
                          <p className={c("text-[13px] font-medium", L.text, L.dtext)}>Source</p>
                          <button onClick={() => open("https://github.com/ptraxzy/lokadev")}
                            className={c("text-[13px] flex items-center gap-1.5 transition-colors", L.muted, L.dmuted, "hover:text-[#1A1815] dark:hover:text-[#EDE9E3]")}>
                            github.com/ptraxzy/lokadev <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </main>
          )}
        </div>
      </div>
    </div>
  );
}
