import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Terminal, Folder, Server, Activity, Cpu, HardDrive,
  Play, Square, RotateCcw, Plus, Globe, Trash2, Settings,
  Minus, Maximize2, X, ExternalLink, Search, RefreshCw,
  LayoutDashboard, ChevronDown, type LucideIcon,
} from "lucide-react";

type ProjectStatus = "running" | "stopped" | "error";

interface Project {
  name: string;
  dir: string;
  domain: string;
  runtime: string;
  server: string;
  database: string;
  status: ProjectStatus;
  pids: number[];
}

interface LogLine {
  t: string;
  l: string;
  m: string;
}

const STATUS_CFG = {
  running: { label: "Running", dot: "bg-green-400 pulse-dot", badge: "bg-green-400/10 border-green-400/30 text-green-400" },
  stopped: { label: "Stopped", dot: "bg-gray-500",            badge: "bg-gray-500/10 border-gray-500/30 text-gray-400" },
  error:   { label: "Error",   dot: "bg-red-400 pulse-dot",   badge: "bg-red-400/10 border-red-400/30 text-red-400" },
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full border ${c.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function Titlebar() {
  const win = getCurrentWindow();
  return (
    <div data-tauri-drag-region className="flex items-center h-9 bg-[#010409] border-b border-[#30363d] px-3 select-none shrink-0">
      <div className="flex items-center gap-2 mr-4" data-tauri-drag-region>
        <div className="w-5 h-5 bg-cyan-500/20 border border-cyan-500/40 rounded flex items-center justify-center">
          <Terminal size={11} className="text-cyan-400" />
        </div>
        <span className="text-xs font-mono font-semibold text-[#e6edf3]">LokaDev</span>
        <span className="text-[10px] font-mono text-[#484f58] border border-[#30363d] px-1.5 py-px rounded">v1.0.4</span>
      </div>
      <div className="flex-1" data-tauri-drag-region />
      <div className="flex items-center gap-1">
        <button onClick={() => win.minimize()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#21262d] text-[#484f58] hover:text-[#e6edf3] transition-colors">
          <Minus size={12} />
        </button>
        <button onClick={() => win.toggleMaximize()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#21262d] text-[#484f58] hover:text-[#e6edf3] transition-colors">
          <Maximize2 size={12} />
        </button>
        <button onClick={() => win.hide()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/20 text-[#484f58] hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [runtime, setRuntime] = useState("php8.3");
  const [server, setServer]   = useState("nginx");
  const [db, setDb]           = useState("mysql");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Project name is required"); return; }
    if (!/^[a-z0-9-_]+$/.test(trimmed)) { setError("Use only lowercase letters, numbers, - or _"); return; }
    setLoading(true);
    setError("");
    try {
      await invoke("run_lokadev", { args: ["create", trimmed, "--runtime", runtime, "--server", server, "--db", db, "--yes"] });
      onCreated();
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-[420px] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Plus size={14} className="text-cyan-400" />
            <span className="text-[13px] font-mono font-semibold">New Project</span>
          </div>
          <button onClick={onClose} className="text-[#484f58] hover:text-[#e6edf3] transition-colors"><X size={14} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-mono text-[#484f58] uppercase tracking-widest block mb-1.5">Project Name</label>
            <input ref={inputRef} value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && create()}
              placeholder="my-project"
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded px-3 py-2 text-[12px] font-mono text-[#e6edf3] placeholder-[#484f58] outline-none transition-colors"
              style={{ WebkitUserSelect: "text", userSelect: "text" }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Runtime",  value: runtime,  set: setRuntime, opts: ["php8.3","php8.2","php8.1","node20","node18","python3","go","static"] },
              { label: "Server",   value: server,   set: setServer,  opts: ["nginx","apache","caddy"] },
              { label: "Database", value: db,        set: setDb,      opts: ["mysql","postgresql","sqlite","none"] },
            ].map(({ label, value, set, opts }) => (
              <div key={label}>
                <label className="text-[10px] font-mono text-[#484f58] uppercase tracking-widest block mb-1.5">{label}</label>
                <div className="relative">
                  <select value={value} onChange={e => set(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-2 text-[11px] font-mono text-[#e6edf3] outline-none appearance-none pr-6 cursor-pointer">
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#484f58] pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-[11px] font-mono text-red-400">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#30363d]">
          <button onClick={onClose} disabled={loading}
            className="text-[11px] font-mono px-3 py-1.5 rounded border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors">
            Cancel
          </button>
          <button onClick={create} disabled={loading || !name.trim()}
            className="text-[11px] font-mono px-4 py-1.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

type Tab = "projects" | "services" | "logs" | "settings";

const SERVICES_DEFAULT = [
  { name: "Nginx",      version: "1.25.3", port: 80,   running: true  },
  { name: "MySQL",      version: "8.0.36", port: 3306, running: true  },
  { name: "PostgreSQL", version: "16.2",   port: 5432, running: false },
  { name: "Redis",      version: "7.2.4",  port: 6379, running: false },
];

function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [daemonOk, setDaemonOk] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const result = await invoke<Project[]>("list_projects");
      setProjects(result);
      setDaemonOk(true);
    } catch {
      setProjects([]);
      setDaemonOk(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  const runCmd = async (cmd: string, name: string) => {
    try {
      await invoke("run_lokadev", { args: [cmd, name] });
      setTimeout(refresh, 800);
    } catch (e) {
      console.error(e);
    }
  };

  return { projects, loading, daemonOk, refresh, runCmd };
}

function useLogs(projects: Project[]) {
  const [logs, setLogs]         = useState<LogLine[]>([]);
  const [project, setProject]   = useState("daemon");
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const url = project === "daemon"
        ? "http://localhost:25000/api/logs"
        : `http://localhost:25000/api/logs?project=${encodeURIComponent(project)}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) setLogs(data as LogLine[]);
      }
    } catch {
      // daemon not running or no logs endpoint
    }
  }, [project]);

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 2000);
    return () => clearInterval(id);
  }, [fetchLogs]);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, autoScroll]);

  return { logs, project, setProject, autoScroll, setAutoScroll, bottomRef, fetchLogs };
}

export default function App() {
  const [tab, setTab]             = useState<Tab>("projects");
  const [selected, setSelected]   = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [showNew, setShowNew]     = useState(false);
  const [services, setServices]   = useState(SERVICES_DEFAULT);
  const [settings, setSettings]   = useState({
    startAtLogin:      true,
    minimizeToTray:    true,
    showNotifications: false,
    daemonPort:        "25000",
    projectsDir:       "~/lokadev-projects",
  });

  const { projects, loading, daemonOk, refresh, runCmd } = useProjects();
  const { logs, project: logProject, setProject: setLogProject, bottomRef, fetchLogs } = useLogs(projects);

  const filtered       = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const selectedProject = projects.find(p => p.name === selected);
  const running        = projects.filter(p => p.status === "running").length;

  const toggleService = (name: string) => {
    setServices(prev => prev.map(s => s.name === name ? { ...s, running: !s.running } : s));
  };

  const NAV: { id: Tab; label: string; Icon: LucideIcon }[] = [
    { id: "projects", label: "Projects", Icon: Folder },
    { id: "services", label: "Services", Icon: Server },
    { id: "logs",     label: "Logs",     Icon: Activity },
    { id: "settings", label: "Settings", Icon: Settings },
  ];

  const LOG_COLORS: Record<string, string> = {
    INFO: "#58a6ff", OK: "#3fb950", WARN: "#d29922", ERROR: "#f85149", DEBUG: "#8b949e",
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3]">
      <Titlebar />

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={refresh} />}

      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ── */}
        <aside className="w-48 shrink-0 flex flex-col bg-[#010409] border-r border-[#30363d]">
          <div className="px-3 py-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${daemonOk ? "bg-green-400 pulse-dot" : "bg-red-400"}`} />
              <span className={daemonOk ? "text-green-400" : "text-red-400"}>
                {daemonOk ? "Daemon active" : "Daemon offline"}
              </span>
            </div>
            <div className="text-[10px] text-[#484f58] mt-0.5">localhost:25000</div>
          </div>

          <nav className="flex flex-col gap-0.5 p-2 flex-1">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-[12px] font-mono w-full text-left transition-colors ${
                  tab === id
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                    : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
                }`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </nav>

          <div className="border-t border-[#30363d] p-3 space-y-2">
            <div className="text-[9px] font-mono text-[#484f58] uppercase tracking-widest mb-2">System</div>
            {[
              { Icon: Cpu,       label: "CPU",  value: "—" },
              { Icon: HardDrive, label: "RAM",  value: "—" },
              { Icon: Folder,    label: "Proj", value: `${running}/${projects.length}` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-[11px] font-mono text-[#484f58]">
                <Icon size={11} className="text-cyan-500/50 shrink-0" />
                <span>{label}</span>
                <span className="ml-auto text-[#8b949e]">{value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#30363d] p-2">
            <button onClick={() => open("http://localhost:25000")}
              className="w-full flex items-center gap-2 text-[11px] font-mono text-[#484f58] hover:text-cyan-400 px-2 py-1.5 rounded hover:bg-[#161b22] transition-colors">
              <Globe size={12} /> Open in browser
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* PROJECTS */}
          {tab === "projects" && (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] shrink-0">
                <div className="flex items-center gap-2 flex-1 bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5">
                  <Search size={13} className="text-[#484f58] shrink-0" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search projects..."
                    className="bg-transparent text-[12px] font-mono text-[#e6edf3] placeholder-[#484f58] outline-none flex-1"
                    style={{ WebkitUserSelect: "text", userSelect: "text" }}
                  />
                </div>
                <button onClick={refresh}
                  className="p-1.5 rounded hover:bg-[#21262d] text-[#484f58] hover:text-[#e6edf3] transition-colors">
                  <RefreshCw size={13} />
                </button>
                <button onClick={() => setShowNew(true)}
                  className="flex items-center gap-1.5 text-[11px] font-mono bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded transition-colors">
                  <Plus size={12} /> New Project
                </button>
              </div>

              <div className="flex flex-1 min-h-0">
                <div className="w-64 shrink-0 border-r border-[#30363d] overflow-y-auto">
                  {loading && (
                    <div className="flex items-center justify-center h-32 text-[#484f58] text-[11px] font-mono">Loading...</div>
                  )}
                  {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-[#484f58] text-[11px] font-mono gap-3 px-4 text-center">
                      <Terminal size={28} className="opacity-30" />
                      {search ? "No matches" : "No projects yet"}
                      {!search && (
                        <button onClick={() => setShowNew(true)}
                          className="text-[10px] font-mono text-cyan-500/60 hover:text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 px-3 py-1 rounded transition-colors">
                          + New Project
                        </button>
                      )}
                    </div>
                  )}
                  {filtered.map(p => (
                    <button key={p.name} onClick={() => setSelected(p.name)}
                      className={`w-full text-left px-3 py-3 border-b border-[#21262d] transition-colors hover:bg-[#161b22] slide-in ${
                        selected === p.name
                          ? "bg-cyan-500/8 border-l-2 border-l-cyan-500"
                          : "border-l-2 border-l-transparent"
                      }`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[12px] font-mono font-semibold text-[#e6edf3] truncate">{p.name}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="text-[10px] font-mono text-[#484f58] truncate">{p.runtime} · {p.server}</div>
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {!selectedProject ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#484f58] font-mono text-[11px] gap-2">
                      <LayoutDashboard size={32} className="opacity-20" />
                      Select a project to view details
                    </div>
                  ) : (
                    <div className="p-6 space-y-6 slide-in">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-lg font-mono font-bold">{selectedProject.name}</h2>
                            <StatusBadge status={selectedProject.status} />
                          </div>
                          <button onClick={() => open(`http://${selectedProject.domain}`)}
                            className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:underline">
                            http://{selectedProject.domain} <ExternalLink size={10} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedProject.status === "running" ? (
                            <button onClick={() => runCmd("stop", selectedProject.name)}
                              className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                              <Square size={12} /> Stop
                            </button>
                          ) : (
                            <button onClick={() => runCmd("start", selectedProject.name)}
                              className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                              <Play size={12} /> Start
                            </button>
                          )}
                          <button onClick={() => runCmd("restart", selectedProject.name)}
                            className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-[#30363d] bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                            <RotateCcw size={12} /> Restart
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Runtime",    value: selectedProject.runtime },
                          { label: "Web Server", value: selectedProject.server },
                          { label: "Database",   value: selectedProject.database },
                          { label: "Domain",     value: selectedProject.domain },
                          { label: "Directory",  value: selectedProject.dir, full: true },
                        ].map(({ label, value, full }) => (
                          <div key={label} className={`bg-[#161b22] border border-[#30363d] rounded p-3 ${full ? "col-span-2" : ""}`}>
                            <div className="text-[9px] font-mono text-[#484f58] uppercase tracking-widest mb-1">{label}</div>
                            <div className="text-[12px] font-mono text-[#e6edf3] truncate">{value}</div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-[#484f58] uppercase tracking-widest mb-2">lokadev.toml</div>
                        <div className="bg-[#010409] border border-[#30363d] rounded p-4 font-mono text-[11px] text-[#8b949e] leading-relaxed">
                          <span className="text-[#7ee787]">[project]</span>{"\n"}
                          <span className="text-[#79c0ff]">name</span> = <span className="text-[#a5d6ff]">"{selectedProject.name}"</span>{"\n"}
                          <span className="text-[#79c0ff]">domain</span> = <span className="text-[#a5d6ff]">"{selectedProject.domain}"</span>{"\n\n"}
                          <span className="text-[#7ee787]">[server]</span>{"\n"}
                          <span className="text-[#79c0ff]">type</span> = <span className="text-[#a5d6ff]">"{selectedProject.server}"</span>{"\n\n"}
                          <span className="text-[#7ee787]">[database]</span>{"\n"}
                          <span className="text-[#79c0ff]">type</span> = <span className="text-[#a5d6ff]">"{selectedProject.database}"</span>
                        </div>
                      </div>

                      <div className="border border-red-500/20 rounded p-4">
                        <div className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest mb-3">Danger Zone</div>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${selectedProject.name}" and all its data?`)) {
                              runCmd("delete", selectedProject.name);
                              setSelected(null);
                            }
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={12} /> Delete Project
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* SERVICES */}
          {tab === "services" && (
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-sm font-mono font-semibold mb-1">Global Services</h2>
              <p className="text-[11px] font-mono text-[#484f58] mb-6">Shared services available to all projects</p>
              <div className="space-y-2">
                {services.map(svc => (
                  <div key={svc.name} className="flex items-center gap-4 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded hover:border-[#484f58] transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${svc.running ? "bg-green-400 pulse-dot" : "bg-[#484f58]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-mono font-semibold">{svc.name}</span>
                        <span className="text-[10px] font-mono text-[#484f58]">v{svc.version}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#484f58]">:{svc.port}</span>
                    </div>
                    <span className={`text-[11px] font-mono w-14 text-right ${svc.running ? "text-green-400" : "text-[#484f58]"}`}>
                      {svc.running ? "running" : "stopped"}
                    </span>
                    <button onClick={() => toggleService(svc.name)}
                      className={`p-1.5 rounded transition-colors ${
                        svc.running
                          ? "text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                          : "text-green-400/60 hover:text-green-400 hover:bg-green-400/10"
                      }`}>
                      {svc.running ? <Square size={12} /> : <Play size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOGS */}
          {tab === "logs" && (
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="relative">
                  <select value={logProject} onChange={e => setLogProject(e.target.value)}
                    className="text-[11px] font-mono bg-[#161b22] border border-[#30363d] text-[#8b949e] rounded px-2 py-1.5 pr-6 outline-none appearance-none cursor-pointer">
                    <option value="daemon">daemon</option>
                    {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#484f58] pointer-events-none" />
                </div>
                <button onClick={fetchLogs}
                  className="p-1.5 rounded hover:bg-[#21262d] text-[#484f58] hover:text-[#e6edf3] transition-colors">
                  <RefreshCw size={12} />
                </button>
                <span className="text-[10px] font-mono text-[#484f58] ml-auto">{logs.length} lines</span>
              </div>
              <div className="flex-1 bg-[#010409] border border-[#30363d] rounded p-4 overflow-y-auto font-mono text-[11px] leading-relaxed">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-[#484f58]">
                    <Activity size={24} className="opacity-30" />
                    <span>No logs yet — start the daemon first</span>
                    <code className="text-[10px] border border-[#30363d] px-2 py-1 rounded">lokadev daemon</code>
                  </div>
                ) : (
                  <>
                    {logs.map((row, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-[#484f58] shrink-0">{row.t}</span>
                        <span className="shrink-0 w-10" style={{ color: LOG_COLORS[row.l] ?? "#8b949e" }}>{row.l}</span>
                        <span className="text-[#8b949e]">{row.m}</span>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h2 className="text-sm font-mono font-semibold mb-6">Settings</h2>

              <div>
                <div className="text-[9px] font-mono text-[#484f58] uppercase tracking-widest mb-3">General</div>
                <div className="space-y-2">
                  {([
                    { key: "startAtLogin",      label: "Start at login",      desc: "Launch daemon and tray on system startup" },
                    { key: "minimizeToTray",     label: "Minimize to tray",    desc: "Closing the window hides to tray" },
                    { key: "showNotifications",  label: "Show notifications",  desc: "Notify when projects start or stop" },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-4 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded">
                      <div>
                        <div className="text-[12px] font-mono text-[#e6edf3]">{label}</div>
                        <div className="text-[10px] font-mono text-[#484f58] mt-0.5">{desc}</div>
                      </div>
                      <button onClick={() => setSettings(s => ({ ...s, [key]: !s[key] }))}
                        className={`w-9 h-5 rounded-full border transition-colors cursor-pointer ${
                          settings[key] ? "bg-cyan-500/30 border-cyan-500/50" : "bg-[#21262d] border-[#30363d]"
                        }`}>
                        <div className={`w-3.5 h-3.5 rounded-full bg-white m-0.5 transition-transform ${settings[key] ? "translate-x-4" : ""}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-mono text-[#484f58] uppercase tracking-widest mb-3">Daemon</div>
                <div className="space-y-2">
                  {([
                    { key: "daemonPort",   label: "Daemon port",        desc: "REST API port" },
                    { key: "projectsDir",  label: "Projects directory", desc: "Default location for new projects" },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-4 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded">
                      <div>
                        <div className="text-[12px] font-mono text-[#e6edf3]">{label}</div>
                        <div className="text-[10px] font-mono text-[#484f58] mt-0.5">{desc}</div>
                      </div>
                      <input value={settings[key]}
                        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                        className="bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded px-2 py-1 text-[11px] font-mono text-[#e6edf3] outline-none w-44 transition-colors"
                        style={{ WebkitUserSelect: "text", userSelect: "text" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-mono text-[#484f58] uppercase tracking-widest mb-3">About</div>
                <div className="space-y-2">
                  {[
                    { label: "Version",  value: "LokaDev v1.0.4" },
                    { label: "License",  value: "MIT License" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded">
                      <div className="text-[12px] font-mono text-[#e6edf3]">{label}</div>
                      <div className="text-[11px] font-mono text-[#8b949e]">{value}</div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded">
                    <div className="text-[12px] font-mono text-[#e6edf3]">Source</div>
                    <button onClick={() => open("https://github.com/ptraxzy/lokadev")}
                      className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1">
                      github.com/ptraxzy/lokadev <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 h-7 bg-[#010409] border-t border-[#30363d] shrink-0 text-[10px] font-mono text-[#484f58]">
        <span>{running} running · {projects.length} total</span>
        <span className="ml-auto">LokaDev v1.0.4</span>
      </div>
    </div>
  );
}
