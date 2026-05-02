import React, { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import { appWindow } from "@tauri-apps/api/window";
import {
  Terminal, Folder, Database, Server, Activity, Cpu, HardDrive,
  Play, Square, RotateCcw, Plus, Globe, Trash2, Settings, ChevronRight,
  Minus, Maximize2, X, ExternalLink, AlertCircle, Clock, CheckCircle2,
  XCircle, Search, Filter, RefreshCw, LayoutDashboard, Bell, GitBranch
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

interface SystemStats {
  daemonRunning: boolean;
  projectCount: number;
  runningCount: number;
}

const STATUS_CFG = {
  running: { label: "Running",  dot: "bg-green-400 pulse-dot", text: "text-green-400",  badge: "bg-green-400/10 border-green-400/30 text-green-400" },
  stopped: { label: "Stopped",  dot: "bg-gray-500",            text: "text-gray-400",   badge: "bg-gray-500/10 border-gray-500/30 text-gray-400" },
  error:   { label: "Error",    dot: "bg-red-400 pulse-dot",   text: "text-red-400",    badge: "bg-red-400/10 border-red-400/30 text-red-400" },
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
  const minimize = () => appWindow.minimize().catch(() => {});
  const maximize = () => appWindow.toggleMaximize().catch(() => {});
  const close    = () => appWindow.hide().catch(() => {});   // hide to tray instead of quit

  return (
    <div className="titlebar-drag flex items-center h-9 bg-[#010409] border-b border-[#30363d] px-3 select-none shrink-0">
      <div className="flex items-center gap-2 mr-4">
        <div className="w-5 h-5 bg-cyan-500/20 border border-cyan-500/40 rounded flex items-center justify-center">
          <Terminal size={11} className="text-cyan-400" />
        </div>
        <span className="text-xs font-mono font-semibold text-[#e6edf3]">LokaDev</span>
        <span className="text-[10px] font-mono text-[#484f58] border border-[#30363d] px-1.5 py-px rounded">v1.0.4</span>
      </div>

      <div className="titlebar-drag flex-1" />

      <div className="titlebar-nodrag flex items-center gap-1">
        <button onClick={minimize} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#21262d] text-[#484f58] hover:text-[#e6edf3] transition-colors">
          <Minus size={12} />
        </button>
        <button onClick={maximize} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#21262d] text-[#484f58] hover:text-[#e6edf3] transition-colors">
          <Maximize2 size={12} />
        </button>
        <button onClick={close} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/20 text-[#484f58] hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

type Tab = "projects" | "services" | "logs" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: "projects", label: "Projects",  icon: Folder },
  { id: "services", label: "Services",  icon: Server },
  { id: "logs",     label: "Logs",      icon: Activity },
  { id: "settings", label: "Settings",  icon: Settings },
];

function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await invoke<Project[]>("list_projects");
      setProjects(result);
    } catch {
      // daemon not running yet — show empty state
      setProjects([]);
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

  return { projects, loading, refresh, runCmd };
}

export default function App() {
  const [tab, setTab] = useState<Tab>("projects");
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { projects, loading, refresh, runCmd } = useProjects();

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const selectedProject = projects.find(p => p.name === selected);
  const running = projects.filter(p => p.status === "running").length;

  const openDashboard = () => open("http://localhost:25000").catch(() => {});
  const openProject   = (domain: string) => open(`http://${domain}`).catch(() => {});

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3]">
      <Titlebar />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 flex flex-col bg-[#010409] border-r border-[#30363d]">

          {/* Daemon status */}
          <div className="px-3 py-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
              <span className="text-green-400">Daemon active</span>
            </div>
            <div className="text-[10px] text-[#484f58] mt-0.5">localhost:25000</div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 p-2 flex-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-[12px] font-mono w-full text-left transition-colors ${
                  tab === id
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                    : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </nav>

          {/* System stats */}
          <div className="border-t border-[#30363d] p-3 space-y-2">
            <div className="text-[9px] font-mono text-[#484f58] uppercase tracking-widest mb-2">System</div>
            {[
              { icon: Cpu,       label: "CPU",  value: "8%" },
              { icon: HardDrive, label: "RAM",  value: "1.2 GB" },
              { icon: Folder,    label: "Proj", value: `${running}/${projects.length}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-[11px] font-mono text-[#484f58]">
                <Icon size={11} className="text-cyan-500/50 shrink-0" />
                <span>{label}</span>
                <span className="ml-auto text-[#8b949e]">{value}</span>
              </div>
            ))}
          </div>

          {/* Open in browser */}
          <div className="border-t border-[#30363d] p-2">
            <button
              onClick={openDashboard}
              className="w-full flex items-center gap-2 text-[11px] font-mono text-[#484f58] hover:text-cyan-400 px-2 py-1.5 rounded hover:bg-[#161b22] transition-colors"
            >
              <Globe size={12} /> Open in browser
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ─── PROJECTS TAB ─── */}
          {tab === "projects" && (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-[#0d1117] shrink-0">
                <div className="flex items-center gap-2 flex-1 bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5">
                  <Search size={13} className="text-[#484f58] shrink-0" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search projects..."
                    className="bg-transparent text-[12px] font-mono text-[#e6edf3] placeholder-[#484f58] outline-none flex-1 titlebar-nodrag"
                    style={{ WebkitUserSelect: "text", userSelect: "text" }}
                  />
                </div>
                <button
                  onClick={refresh}
                  className="p-1.5 rounded hover:bg-[#21262d] text-[#484f58] hover:text-[#e6edf3] transition-colors"
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  onClick={() => invoke("run_lokadev", { args: ["create", "--interactive"] }).catch(() => {})}
                  className="flex items-center gap-1.5 text-[11px] font-mono bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded transition-colors"
                >
                  <Plus size={12} /> New Project
                </button>
              </div>

              {/* Project list + detail split */}
              <div className="flex flex-1 min-h-0">

                {/* List */}
                <div className="w-64 shrink-0 border-r border-[#30363d] overflow-y-auto">
                  {loading && (
                    <div className="flex items-center justify-center h-32 text-[#484f58] text-[11px] font-mono">
                      Loading...
                    </div>
                  )}
                  {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-[#484f58] text-[11px] font-mono gap-3 px-4 text-center">
                      <Terminal size={28} className="opacity-30" />
                      {search ? "No matches" : "No projects yet"}
                      {!search && (
                        <span className="text-[10px] text-[#30363d]">
                          Run: lokadev create my-app
                        </span>
                      )}
                    </div>
                  )}
                  {filtered.map(p => (
                    <button
                      key={p.name}
                      onClick={() => setSelected(p.name)}
                      className={`w-full text-left px-3 py-3 border-b border-[#21262d] transition-colors hover:bg-[#161b22] slide-in ${
                        selected === p.name ? "bg-cyan-500/8 border-l-2 border-l-cyan-500" : "border-l-2 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[12px] font-mono font-semibold text-[#e6edf3] truncate">{p.name}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="text-[10px] font-mono text-[#484f58] truncate">
                        {p.runtime} · {p.server}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Detail */}
                <div className="flex-1 overflow-y-auto">
                  {!selectedProject ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#484f58] font-mono text-[11px] gap-2">
                      <LayoutDashboard size={32} className="opacity-20" />
                      Select a project to view details
                    </div>
                  ) : (
                    <div className="p-6 space-y-6 slide-in">
                      {/* Project header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-lg font-mono font-bold text-[#e6edf3]">{selectedProject.name}</h2>
                            <StatusBadge status={selectedProject.status} />
                          </div>
                          <button
                            onClick={() => openProject(selectedProject.domain)}
                            className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:underline"
                          >
                            http://{selectedProject.domain} <ExternalLink size={10} />
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {selectedProject.status === "running" ? (
                            <button
                              onClick={() => runCmd("stop", selectedProject.name)}
                              className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Square size={12} /> Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => runCmd("start", selectedProject.name)}
                              className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                            >
                              <Play size={12} /> Start
                            </button>
                          )}
                          <button
                            onClick={() => runCmd("restart", selectedProject.name)}
                            className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-[#30363d] bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                          >
                            <RotateCcw size={12} /> Restart
                          </button>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Runtime",   value: selectedProject.runtime },
                          { label: "Web Server", value: selectedProject.server },
                          { label: "Database",  value: selectedProject.database },
                          { label: "Domain",    value: selectedProject.domain },
                          { label: "Directory", value: selectedProject.dir, mono: true, full: true },
                        ].map(({ label, value, full }) => (
                          <div
                            key={label}
                            className={`bg-[#161b22] border border-[#30363d] rounded p-3 ${full ? "col-span-2" : ""}`}
                          >
                            <div className="text-[9px] font-mono text-[#484f58] uppercase tracking-widest mb-1">{label}</div>
                            <div className="text-[12px] font-mono text-[#e6edf3] truncate">{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Config file preview */}
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

                      {/* Danger zone */}
                      <div className="border border-red-500/20 rounded p-4">
                        <div className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest mb-3">Danger Zone</div>
                        <button
                          onClick={() => {
                            if (confirm(`Delete project "${selectedProject.name}" and all its data?`)) {
                              runCmd("delete", selectedProject.name);
                              setSelected(null);
                            }
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={12} /> Delete Project
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── SERVICES TAB ─── */}
          {tab === "services" && (
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-sm font-mono font-semibold text-[#e6edf3] mb-6">Global Services</h2>
              <div className="space-y-2">
                {[
                  { name: "Nginx",      version: "1.25.3",  port: 80,   status: "running" as const },
                  { name: "MySQL",      version: "8.0.36",  port: 3306, status: "running" as const },
                  { name: "PostgreSQL", version: "16.2",    port: 5432, status: "running" as const },
                  { name: "Redis",      version: "7.2.4",   port: 6379, status: "stopped" as const },
                  { name: "Caddy",      version: "2.7.6",   port: 443,  status: "stopped" as const },
                  { name: "MariaDB",    version: "10.11.7", port: 3307, status: "stopped" as const },
                ].map(svc => (
                  <div key={svc.name} className="flex items-center gap-4 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded hover:border-[#484f58] transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${svc.status === "running" ? "bg-green-400 pulse-dot" : "bg-[#484f58]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-mono font-semibold text-[#e6edf3]">{svc.name}</span>
                        <span className="text-[10px] font-mono text-[#484f58]">v{svc.version}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#484f58]">:{svc.port}</span>
                    </div>
                    <span className={`text-[11px] font-mono ${svc.status === "running" ? "text-green-400" : "text-[#484f58]"}`}>
                      {svc.status}
                    </span>
                    <button className={`p-1.5 rounded transition-colors ${
                      svc.status === "running"
                        ? "text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                        : "text-green-400/60 hover:text-green-400 hover:bg-green-400/10"
                    }`}>
                      {svc.status === "running" ? <Square size={12} /> : <Play size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── LOGS TAB ─── */}
          {tab === "logs" && (
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center gap-3 mb-4 shrink-0">
                <select className="text-[11px] font-mono bg-[#161b22] border border-[#30363d] text-[#8b949e] rounded px-2 py-1.5 outline-none">
                  {projects.length > 0
                    ? projects.map(p => <option key={p.name}>{p.name}</option>)
                    : <option>daemon</option>
                  }
                </select>
                <button className="ml-auto text-[11px] font-mono text-[#484f58] hover:text-[#e6edf3] px-2 py-1 border border-[#30363d] rounded transition-colors">
                  Clear
                </button>
              </div>
              <div className="flex-1 bg-[#010409] border border-[#30363d] rounded p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1">
                {[
                  { t: "17:01:03", l: "INFO",  m: "[daemon] LokaDev v1.0.4 starting" },
                  { t: "17:01:03", l: "INFO",  m: "[daemon] Listening on :25000" },
                  { t: "17:01:04", l: "OK",    m: "[daemon] Registry loaded — 2 projects" },
                  { t: "17:01:05", l: "INFO",  m: "[nginx] Starting worker process (pid 1042)" },
                  { t: "17:01:06", l: "OK",    m: "[nginx] Listening on :80" },
                  { t: "17:02:11", l: "INFO",  m: "[nginx] GET / 200 4.2ms" },
                  { t: "17:03:45", l: "WARN",  m: "[php-fpm] slow request: /api (1212ms)" },
                  { t: "17:04:01", l: "INFO",  m: "[daemon] health check passed" },
                  { t: "17:06:00", l: "INFO",  m: "[daemon] heartbeat ok (uptime: 5m)" },
                ].map((row, i) => {
                  const colors: Record<string, string> = { INFO: "#58a6ff", OK: "#3fb950", WARN: "#d29922", ERROR: "#f85149" };
                  return (
                    <div key={i} className="flex gap-3">
                      <span className="text-[#484f58] shrink-0">{row.t}</span>
                      <span className={`shrink-0 w-10`} style={{ color: colors[row.l] }}>{row.l}</span>
                      <span className="text-[#8b949e]">{row.m}</span>
                    </div>
                  );
                })}
                <div className="flex gap-3">
                  <span className="text-[#484f58] shrink-0">17:06:01</span>
                  <span className="text-[#58a6ff] shrink-0 w-10">INFO</span>
                  <span className="text-[#8b949e]">[daemon] <span className="bg-[#58a6ff]/20 rounded px-0.5 animate-pulse">█</span></span>
                </div>
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {tab === "settings" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h2 className="text-sm font-mono font-semibold text-[#e6edf3] mb-6">Settings</h2>

              {[
                {
                  title: "General",
                  items: [
                    { label: "Start LokaDev at login", desc: "Launch daemon and tray on system startup", type: "toggle", value: true },
                    { label: "Minimize to tray on close", desc: "Closing the window hides it to the system tray", type: "toggle", value: true },
                    { label: "Show notifications", desc: "Notify when projects start or stop", type: "toggle", value: false },
                  ]
                },
                {
                  title: "Daemon",
                  items: [
                    { label: "Daemon port", desc: "Port for the LokaDev web dashboard", type: "input", value: "25000" },
                    { label: "Projects directory", desc: "Default location for new projects", type: "input", value: "~/lokadev-projects" },
                  ]
                },
                {
                  title: "About",
                  items: [
                    { label: "Version", desc: "LokaDev v1.0.4", type: "text" },
                    { label: "License", desc: "MIT License", type: "text" },
                    { label: "Source", desc: "github.com/ptraxzy/lokadev", type: "link", value: "https://github.com/ptraxzy/lokadev" },
                  ]
                }
              ].map(section => (
                <div key={section.title}>
                  <div className="text-[9px] font-mono text-[#484f58] uppercase tracking-widest mb-3">{section.title}</div>
                  <div className="space-y-2">
                    {section.items.map(item => (
                      <div key={item.label} className="flex items-center justify-between gap-4 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded">
                        <div>
                          <div className="text-[12px] font-mono text-[#e6edf3]">{item.label}</div>
                          {item.desc && <div className="text-[10px] font-mono text-[#484f58] mt-0.5">{item.desc}</div>}
                        </div>
                        {item.type === "toggle" && (
                          <div className={`w-9 h-5 rounded-full border transition-colors cursor-pointer ${
                            item.value ? "bg-cyan-500/30 border-cyan-500/50" : "bg-[#21262d] border-[#30363d]"
                          }`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white m-0.5 transition-transform ${item.value ? "translate-x-4" : ""}`} />
                          </div>
                        )}
                        {item.type === "input" && (
                          <input
                            defaultValue={item.value}
                            className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-[11px] font-mono text-[#e6edf3] outline-none focus:border-cyan-500/50 w-40"
                            style={{ WebkitUserSelect: "text", userSelect: "text" }}
                          />
                        )}
                        {item.type === "link" && (
                          <button
                            onClick={() => open(item.value!).catch(() => {})}
                            className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            GitHub <ExternalLink size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-[#010409] border-t border-[#30363d] text-[10px] font-mono text-[#484f58] shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
          {running} running · {projects.length} total
        </span>
        <span className="ml-auto">LokaDev v1.0.4 · Fedora 43</span>
      </div>
    </div>
  );
}
