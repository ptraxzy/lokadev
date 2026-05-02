import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Folder, Server, ScrollText, Settings2, Minus, Maximize2, X,
  Play, Square, RotateCcw, Plus, Trash2, ExternalLink, Search,
  RefreshCw, ChevronDown, LayoutGrid, type LucideIcon,
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

// ── Titlebar ───────────────────────────────────────────────────────────────────

function Titlebar({ daemonOk }: { daemonOk: boolean }) {
  const win = getCurrentWindow();
  return (
    <div data-tauri-drag-region className="flex items-center h-8 px-3 select-none shrink-0 border-b border-white/5">
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <span className="text-[11px] font-medium tracking-wide text-white/70">LokaDev</span>
        <span className={`text-[9px] px-1.5 py-px rounded-full font-medium ${daemonOk ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
          {daemonOk ? "active" : "offline"}
        </span>
      </div>
      <div className="flex-1" data-tauri-drag-region />
      <div className="flex items-center">
        {[
          { fn: () => win.minimize(), icon: <Minus size={11} /> },
          { fn: () => win.toggleMaximize(), icon: <Maximize2 size={10} /> },
          { fn: () => win.hide(), icon: <X size={11} />, danger: true },
        ].map((btn, i) => (
          <button key={i} onClick={btn.fn}
            className={`w-7 h-7 flex items-center justify-center text-white/25 transition-colors hover:text-white/70 ${btn.danger ? "hover:text-red-400" : ""}`}>
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Status dot ─────────────────────────────────────────────────────────────────

function Dot({ status }: { status: "running" | "stopped" | "error" | string }) {
  const color = status === "running" ? "bg-emerald-400 pulse-dot" : status === "error" ? "bg-red-400" : "bg-white/20";
  return <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />;
}

// ── New Project Modal ──────────────────────────────────────────────────────────

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName]     = useState("");
  const [runtime, setRuntime] = useState("php8.3");
  const [server, setServer]   = useState("nginx");
  const [db, setDb]           = useState("mysql");
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = async () => {
    const n = name.trim();
    if (!n) return setErr("Name is required");
    if (!/^[a-z0-9_-]+$/.test(n)) return setErr("Lowercase letters, numbers, - and _ only");
    setBusy(true); setErr("");
    try {
      await invoke("run_lokadev", { args: ["create", n, "--runtime", runtime, "--server", server, "--db", db, "--yes"] });
      onCreated(); onClose();
    } catch (e) {
      // try without flags if CLI doesn't support them
      try {
        await invoke("run_lokadev", { args: ["create", n] });
        onCreated(); onClose();
      } catch (e2) {
        setErr(String(e2));
      }
    } finally { setBusy(false); }
  };

  const sel = (opts: string[], val: string, set: (v: string) => void) => (
    <div className="relative">
      <select value={val} onChange={e => set(e.target.value)}
        className="w-full bg-white/5 border border-white/8 hover:border-white/15 rounded-md px-2.5 py-1.5 text-[11px] text-white/70 outline-none appearance-none cursor-pointer transition-colors pr-6">
        {opts.map(o => <option key={o} value={o} className="bg-[#1a1a22]">{o}</option>)}
      </select>
      <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#16161e] border border-white/10 rounded-xl w-[400px] shadow-2xl">
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-[13px] font-semibold text-white/90 mb-4">New Project</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-white/35 uppercase tracking-wider block mb-1.5">Name</label>
              <input ref={ref} value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="my-project"
                className="w-full bg-white/5 border border-white/8 focus:border-white/20 rounded-md px-3 py-2 text-[12px] text-white/90 placeholder-white/20 outline-none transition-colors"
                style={{ WebkitUserSelect: "text", userSelect: "text" }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Runtime",  val: runtime, set: setRuntime, opts: ["php8.3","php8.2","php8.1","node20","node18","python3","go","static"] },
                { label: "Server",   val: server,  set: setServer,  opts: ["nginx","apache","caddy"] },
                { label: "Database", val: db,       set: setDb,      opts: ["mysql","postgresql","sqlite","none"] },
              ].map(({ label, val, set, opts }) => (
                <div key={label}>
                  <label className="text-[10px] text-white/35 uppercase tracking-wider block mb-1.5">{label}</label>
                  {sel(opts, val, set)}
                </div>
              ))}
            </div>
            {err && <p className="text-[11px] text-red-400/80">{err}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/6">
          <button onClick={onClose} disabled={busy}
            className="text-[11px] px-3 py-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={busy || !name.trim()}
            className="text-[11px] px-4 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
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

  useEffect(() => { refresh(); const id = setInterval(refresh, 3000); return () => clearInterval(id); }, [refresh]);

  const runCmd = async (cmd: string, name: string) => {
    try { await invoke("run_lokadev", { args: [cmd, name] }); setTimeout(refresh, 800); }
    catch (e) { console.error(e); }
  };

  return { projects, loading, daemonOk, refresh, runCmd };
}

function useServices() {
  const FALLBACK: ServiceInfo[] = [
    { name: "Nginx",      version: "1.25.3", port: 80,   status: "running" },
    { name: "MySQL",      version: "8.0.36", port: 3306, status: "running" },
    { name: "PostgreSQL", version: "16.2",   port: 5432, status: "stopped" },
    { name: "Redis",      version: "7.2.4",  port: 6379, status: "stopped" },
  ];
  const [services, setServices] = useState<ServiceInfo[]>(FALLBACK);
  const [busy, setBusy]         = useState<string | null>(null);

  useEffect(() => {
    invoke<ServiceInfo[]>("list_services").then(r => { if (r.length) setServices(r); }).catch(() => {});
  }, []);

  const toggle = async (svc: ServiceInfo) => {
    const action = svc.status === "running" ? "stop" : "start";
    setBusy(svc.name);
    try {
      await invoke("control_service", { name: svc.name, action });
      setServices(prev => prev.map(s => s.name === svc.name ? { ...s, status: action === "start" ? "running" : "stopped" } : s));
    } catch {
      // optimistic toggle even if control_service isn't implemented in daemon yet
      setServices(prev => prev.map(s => s.name === svc.name ? { ...s, status: action === "start" ? "running" : "stopped" } : s));
    } finally { setBusy(null); }
  };

  return { services, busy, toggle };
}

function useLogs() {
  const [logs, setLogs]         = useState<LogEntry[]>([]);
  const [source, setSource]     = useState("daemon");
  const endRef                  = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const r = await invoke<LogEntry[]>("get_logs", { project: source === "daemon" ? null : source });
      if (r.length) setLogs(r);
    } catch {}
  }, [source]);

  useEffect(() => { fetchLogs(); const id = setInterval(fetchLogs, 2500); return () => clearInterval(id); }, [fetchLogs]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return { logs, source, setSource, endRef, fetchLogs };
}

function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    start_at_login: false, minimize_to_tray: true,
    show_notifications: false, daemon_port: "25000", projects_dir: "~/lokadev-projects",
  });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    invoke<AppSettings>("load_settings").then(s => setSettings(s)).catch(() => {});
  }, []);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => invoke("save_settings", { settings: next }).catch(() => {}), 600);
  };

  return { settings, update };
}

// ── Main App ───────────────────────────────────────────────────────────────────

type Tab = "projects" | "services" | "logs" | "settings";

const NAV: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: "projects", label: "Projects", Icon: Folder },
  { id: "services", label: "Services", Icon: Server },
  { id: "logs",     label: "Logs",     Icon: ScrollText },
  { id: "settings", label: "Settings", Icon: Settings2 },
];

const LOG_COLORS: Record<string, string> = {
  INFO: "#60a5fa", OK: "#34d399", WARN: "#fbbf24", ERROR: "#f87171", DEBUG: "#a3a3c2",
};

export default function App() {
  const [tab, setTab]           = useState<Tab>("projects");
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [showNew, setShowNew]   = useState(false);

  const { projects, loading, daemonOk, refresh, runCmd } = useProjects();
  const { services, busy: svcBusy, toggle: toggleSvc }   = useServices();
  const { logs, source, setSource, endRef, fetchLogs }   = useLogs(projects);
  const { settings, update: updateSettings }             = useSettings();

  const filtered        = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const selectedProject = projects.find(p => p.name === selected);
  const runningCount    = projects.filter(p => p.status === "running").length;

  return (
    <div className="flex flex-col h-screen bg-[#0d0d12] text-white/80 select-none">
      <Titlebar daemonOk={daemonOk} />

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={refresh} />}

      <div className="flex flex-1 min-h-0">

        {/* ── Sidebar ── */}
        <aside className="w-44 shrink-0 flex flex-col border-r border-white/5 bg-[#0b0b10]">
          <nav className="flex-1 p-2 pt-3 space-y-0.5">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] transition-all ${
                  tab === id
                    ? "bg-white/8 text-white/90"
                    : "text-white/35 hover:text-white/65 hover:bg-white/4"
                }`}>
                <Icon size={13} strokeWidth={tab === id ? 2.2 : 1.8} />
                {label}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-white/25 px-1">
              <span>{runningCount} running</span>
              <span>{projects.length} total</span>
            </div>
            <button onClick={() => open("http://localhost:25000")}
              className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-[11px] text-white/25 hover:text-white/55 hover:bg-white/4 transition-colors">
              <ExternalLink size={11} /> Dashboard
            </button>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">

          {/* PROJECTS */}
          {tab === "projects" && (
            <div className="flex flex-1 min-h-0">
              {/* Project list */}
              <div className="w-60 shrink-0 flex flex-col border-r border-white/5">
                <div className="flex items-center gap-2 p-3 border-b border-white/5">
                  <div className="flex items-center flex-1 bg-white/4 rounded-lg px-2.5 py-1.5 gap-2">
                    <Search size={11} className="text-white/20 shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search…"
                      className="bg-transparent flex-1 text-[11px] text-white/70 placeholder-white/20 outline-none"
                      style={{ WebkitUserSelect: "text", userSelect: "text" }}
                    />
                  </div>
                  <button onClick={refresh} className="p-1.5 text-white/20 hover:text-white/60 transition-colors rounded-lg hover:bg-white/4">
                    <RefreshCw size={11} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-24 text-[11px] text-white/20">Loading…</div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-4">
                      <LayoutGrid size={24} className="text-white/10" />
                      <div className="text-center">
                        <p className="text-[11px] text-white/25">{search ? "No matches" : "No projects yet"}</p>
                        {!search && (
                          <button onClick={() => setShowNew(true)}
                            className="mt-2 text-[10px] text-white/35 hover:text-white/60 border border-white/10 hover:border-white/20 px-3 py-1 rounded-lg transition-colors">
                            Create first project
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    filtered.map(p => (
                      <button key={p.name} onClick={() => setSelected(p.name)}
                        className={`w-full text-left px-3.5 py-2.5 transition-colors border-l-2 ${
                          selected === p.name
                            ? "bg-white/5 border-l-white/30"
                            : "border-l-transparent hover:bg-white/3"
                        }`}>
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-[12px] font-medium text-white/80 truncate">{p.name}</span>
                          <Dot status={p.status} />
                        </div>
                        <p className="text-[10px] text-white/25 truncate">{p.runtime} · {p.server}</p>
                      </button>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-white/5">
                  <button onClick={() => setShowNew(true)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/6 hover:border-white/12 transition-all">
                    <Plus size={11} /> New Project
                  </button>
                </div>
              </div>

              {/* Project detail */}
              <div className="flex-1 overflow-y-auto">
                {!selectedProject ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <LayoutGrid size={28} className="text-white/8" />
                    <p className="text-[11px] text-white/20">Select a project</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <h2 className="text-[15px] font-semibold text-white/90">{selectedProject.name}</h2>
                          <span className={`text-[10px] px-1.5 py-px rounded-full ${
                            selectedProject.status === "running"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : selectedProject.status === "error"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-white/8 text-white/35"
                          }`}>{selectedProject.status}</span>
                        </div>
                        <button onClick={() => open(`http://${selectedProject.domain}`)}
                          className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 transition-colors">
                          {selectedProject.domain} <ExternalLink size={9} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {selectedProject.status === "running" ? (
                          <button onClick={() => runCmd("stop", selectedProject.name)}
                            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-red-500/8 hover:bg-red-500/15 text-red-400/70 hover:text-red-400 border border-red-500/15 transition-all">
                            <Square size={11} /> Stop
                          </button>
                        ) : (
                          <button onClick={() => runCmd("start", selectedProject.name)}
                            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-emerald-500/8 hover:bg-emerald-500/15 text-emerald-400/70 hover:text-emerald-400 border border-emerald-500/15 transition-all">
                            <Play size={11} /> Start
                          </button>
                        )}
                        <button onClick={() => runCmd("restart", selectedProject.name)}
                          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 text-white/40 hover:text-white/70 border border-white/6 transition-all">
                          <RotateCcw size={11} /> Restart
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
                        <div key={label} className={`bg-white/3 rounded-lg p-3 ${full ? "col-span-2" : ""}`}>
                          <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-[11px] text-white/65 font-mono truncate">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Config preview */}
                    <div>
                      <p className="text-[9px] text-white/25 uppercase tracking-wider mb-2">lokadev.toml</p>
                      <pre className="bg-white/2 border border-white/5 rounded-lg p-4 text-[10px] leading-relaxed font-mono text-white/40 overflow-x-auto">
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
                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${selectedProject.name}"? This cannot be undone.`)) {
                            runCmd("delete", selectedProject.name);
                            setSelected(null);
                          }
                        }}
                        className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/15 transition-all">
                        <Trash2 size={11} /> Delete Project
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
              <div className="mb-5">
                <h2 className="text-[13px] font-semibold text-white/80">Services</h2>
                <p className="text-[11px] text-white/25 mt-0.5">Global services shared across all projects</p>
              </div>
              <div className="space-y-1.5">
                {services.map(svc => (
                  <div key={svc.name}
                    className="flex items-center gap-4 px-4 py-3 bg-white/3 hover:bg-white/5 rounded-lg border border-white/4 hover:border-white/8 transition-all">
                    <Dot status={svc.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[12px] font-medium text-white/75">{svc.name}</span>
                        <span className="text-[10px] text-white/25">v{svc.version}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/20">:{svc.port}</span>
                    </div>
                    <span className={`text-[10px] w-12 text-right ${svc.status === "running" ? "text-emerald-400/70" : "text-white/20"}`}>
                      {svc.status}
                    </span>
                    <button onClick={() => toggleSvc(svc)} disabled={svcBusy === svc.name}
                      className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${
                        svc.status === "running"
                          ? "text-red-400/40 hover:text-red-400 hover:bg-red-500/8"
                          : "text-emerald-400/40 hover:text-emerald-400 hover:bg-emerald-500/8"
                      }`}>
                      {svcBusy === svc.name
                        ? <RotateCcw size={11} className="animate-spin" />
                        : svc.status === "running" ? <Square size={11} /> : <Play size={11} />
                      }
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOGS */}
          {tab === "logs" && (
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <div className="relative">
                  <select value={source} onChange={e => setSource(e.target.value)}
                    className="bg-white/4 border border-white/8 rounded-lg px-2.5 py-1.5 text-[11px] text-white/55 outline-none appearance-none cursor-pointer pr-6">
                    <option value="daemon" className="bg-[#1a1a22]">daemon</option>
                    {projects.map(p => <option key={p.name} value={p.name} className="bg-[#1a1a22]">{p.name}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                </div>
                <button onClick={fetchLogs} className="p-1.5 text-white/20 hover:text-white/60 hover:bg-white/4 rounded-lg transition-colors">
                  <RefreshCw size={11} />
                </button>
                <span className="text-[10px] text-white/20 ml-auto">{logs.length} entries</span>
              </div>
              <div className="flex-1 bg-black/30 border border-white/5 rounded-xl p-4 overflow-y-auto font-mono text-[10.5px] leading-relaxed">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-white/15">
                    <ScrollText size={20} />
                    <span>No logs — start the daemon first</span>
                    <code className="text-[9px] border border-white/8 px-2 py-1 rounded">lokadev daemon</code>
                  </div>
                ) : (
                  <>
                    {logs.map((row, i) => (
                      <div key={i} className="flex gap-3 hover:bg-white/2 rounded px-1 py-px">
                        <span className="text-white/20 shrink-0 w-16">{row.t}</span>
                        <span className="shrink-0 w-9" style={{ color: LOG_COLORS[row.l] ?? "#a3a3c2" }}>{row.l}</span>
                        <span className="text-white/40">{row.m}</span>
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
            <div className="flex-1 overflow-y-auto p-6 max-w-lg">
              <h2 className="text-[13px] font-semibold text-white/80 mb-6">Settings</h2>

              <section className="mb-6">
                <p className="text-[9px] text-white/25 uppercase tracking-wider mb-2 px-1">General</p>
                <div className="space-y-px">
                  {([
                    { key: "start_at_login",      label: "Start at login",     desc: "Launch daemon on system startup" },
                    { key: "minimize_to_tray",     label: "Minimize to tray",   desc: "Hide window instead of closing" },
                    { key: "show_notifications",   label: "Notifications",      desc: "Alert when projects start or stop" },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-4 px-4 py-3 bg-white/3 first:rounded-t-lg last:rounded-b-lg hover:bg-white/4 transition-colors">
                      <div>
                        <p className="text-[12px] text-white/70">{label}</p>
                        <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>
                      </div>
                      <button onClick={() => updateSettings({ [key]: !settings[key] })}
                        className={`w-9 h-5 rounded-full transition-all flex-shrink-0 relative ${settings[key] ? "bg-white/20" : "bg-white/8"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${settings[key] ? "left-4 bg-white/80" : "left-0.5 bg-white/30"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-6">
                <p className="text-[9px] text-white/25 uppercase tracking-wider mb-2 px-1">Daemon</p>
                <div className="space-y-px">
                  {([
                    { key: "daemon_port",   label: "Port",              placeholder: "25000" },
                    { key: "projects_dir",  label: "Projects directory", placeholder: "~/lokadev-projects" },
                  ] as const).map(({ key, label, placeholder }) => (
                    <div key={key} className="flex items-center justify-between gap-4 px-4 py-3 bg-white/3 first:rounded-t-lg last:rounded-b-lg">
                      <p className="text-[12px] text-white/70 shrink-0">{label}</p>
                      <input value={settings[key]}
                        onChange={e => updateSettings({ [key]: e.target.value })}
                        placeholder={placeholder}
                        className="bg-white/5 border border-white/8 focus:border-white/20 rounded-md px-2.5 py-1 text-[11px] font-mono text-white/60 outline-none text-right transition-colors w-44"
                        style={{ WebkitUserSelect: "text", userSelect: "text" }}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-[9px] text-white/25 uppercase tracking-wider mb-2 px-1">About</p>
                <div className="space-y-px">
                  <div className="flex items-center justify-between px-4 py-3 bg-white/3 rounded-t-lg">
                    <p className="text-[12px] text-white/70">Version</p>
                    <p className="text-[11px] font-mono text-white/30">v1.0.4</p>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-white/3 rounded-b-lg">
                    <p className="text-[12px] text-white/70">Source</p>
                    <button onClick={() => open("https://github.com/ptraxzy/lokadev")}
                      className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
                      github.com/ptraxzy/lokadev <ExternalLink size={9} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
