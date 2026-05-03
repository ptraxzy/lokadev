use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_shell::ShellExt;

// ── Data types ────────────────────────────────────────────────────────────────

/// Accepts both lowercase (JSON-tagged) and PascalCase (Go default) field names
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(default)]
pub struct Project {
    #[serde(alias = "Name")]
    pub name: String,
    #[serde(alias = "Dir")]
    pub dir: String,
    #[serde(alias = "Domain")]
    pub domain: String,
    #[serde(alias = "Runtime")]
    pub runtime: String,
    #[serde(alias = "Server")]
    pub server: String,
    #[serde(alias = "Database")]
    pub database: String,
    #[serde(alias = "Status")]
    pub status: String,
    #[serde(alias = "Pids", alias = "PIDs")]
    pub pids: Vec<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ServiceInfo {
    pub name: String,
    pub version: String,
    pub port: u16,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub t: String,
    pub l: String,
    pub m: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub start_at_login: bool,
    pub minimize_to_tray: bool,
    pub show_notifications: bool,
    pub daemon_port: String,
    pub projects_dir: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            start_at_login: false,
            minimize_to_tray: true,
            show_notifications: false,
            daemon_port: "25000".to_string(),
            projects_dir: "~/lokadev-projects".to_string(),
        }
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn find_lokadev_binary() -> String {
    for candidate in &["/usr/local/bin/lokadev", "/usr/bin/lokadev", "lokadev"] {
        if std::path::Path::new(candidate).exists() {
            return candidate.to_string();
        }
    }
    "lokadev".to_string()
}

fn settings_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "~".to_string());
    PathBuf::from(home).join(".config/lokadev/settings.json")
}

fn build_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .map_err(|e| e.to_string())
}

// ── Commands ──────────────────────────────────────────────────────────────────

#[tauri::command]
async fn list_projects() -> Result<Vec<Project>, String> {
    let client = build_client()?;
    // Connection failure = daemon truly offline → propagate error
    let resp = client
        .get("http://localhost:25000/api/projects")
        .send()
        .await
        .map_err(|e| format!("Daemon not running: {}", e))?;

    // Read raw text so we can handle any response format gracefully
    let text = resp.text().await.map_err(|e| e.to_string())?;
    let trimmed = text.trim();

    // Empty / null / {} → no projects yet, daemon is online
    if trimmed.is_empty() || trimmed == "null" || trimmed == "{}" {
        return Ok(vec![]);
    }

    // Try array first (standard format)
    if let Ok(list) = serde_json::from_str::<Vec<Project>>(trimmed) {
        return Ok(list);
    }

    // Try {"projects": [...]} wrapper
    if let Ok(obj) = serde_json::from_str::<serde_json::Value>(trimmed) {
        if let Some(arr) = obj.get("projects").and_then(|v| v.as_array()) {
            let list: Vec<Project> = arr.iter()
                .filter_map(|v| serde_json::from_value(v.clone()).ok())
                .collect();
            return Ok(list);
        }
        if let Some(arr) = obj.get("data").and_then(|v| v.as_array()) {
            let list: Vec<Project> = arr.iter()
                .filter_map(|v| serde_json::from_value(v.clone()).ok())
                .collect();
            return Ok(list);
        }
    }

    // Unknown format but daemon responded — treat as online, no projects
    Ok(vec![])
}

#[tauri::command]
async fn run_lokadev(args: Vec<String>) -> Result<String, String> {
    let binary = find_lokadev_binary();
    let output = Command::new(&binary)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to run lokadev (tried '{}'): {}", binary, e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(if stderr.is_empty() { stdout } else { stderr })
    }
}

#[tauri::command]
async fn start_daemon() -> Result<(), String> {
    let binary = find_lokadev_binary();
    Command::new(&binary)
        .arg("daemon")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("Could not start daemon: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn list_services() -> Result<Vec<ServiceInfo>, String> {
    let client = build_client()?;
    match client
        .get("http://localhost:25000/api/services")
        .send()
        .await
    {
        Ok(resp) if resp.status().is_success() => {
            resp.json::<Vec<ServiceInfo>>()
                .await
                .map_err(|e| e.to_string())
        }
        _ => Ok(vec![]),
    }
}

#[tauri::command]
async fn control_service(name: String, action: String) -> Result<(), String> {
    let client = build_client()?;
    let url = format!("http://localhost:25000/api/services/{}/{}", name, action);
    match client.post(&url).send().await {
        Ok(resp) if resp.status().is_success() => return Ok(()),
        _ => {}
    }
    // Fallback: lokadev service <action> <name>
    let binary = find_lokadev_binary();
    let output = Command::new(&binary)
        .args(&["service", &action, &name.to_lowercase()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed: {}", e))?;
    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn get_logs(project: Option<String>) -> Result<Vec<LogEntry>, String> {
    let client = build_client()?;
    let url = match &project {
        Some(p) if p != "daemon" => {
            format!("http://localhost:25000/api/logs?project={}", p)
        }
        _ => "http://localhost:25000/api/logs".to_string(),
    };
    match client.get(&url).send().await {
        Ok(resp) if resp.status().is_success() => {
            resp.json::<Vec<LogEntry>>()
                .await
                .map_err(|e| e.to_string())
        }
        _ => Ok(vec![]),
    }
}

#[tauri::command]
async fn load_settings() -> Result<AppSettings, String> {
    let path = settings_path();
    if !path.exists() {
        return Ok(AppSettings::default());
    }
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_settings(settings: AppSettings) -> Result<(), String> {
    let path = settings_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

// ── App entry ─────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let show = MenuItemBuilder::with_id("show", "Show LokaDev").build(app)?;
            let dashboard =
                MenuItemBuilder::with_id("dashboard", "Open Dashboard").build(app)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit LokaDev").build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&show)
                .item(&dashboard)
                .item(&sep)
                .item(&quit)
                .build()?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .menu_on_left_click(false)
                .tooltip("LokaDev")
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(win) = app.get_webview_window("main") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                        }
                    }
                })
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        }
                    }
                    "dashboard" => {
                        let _ = app.shell().open("http://localhost:25000", None);
                    }
                    "quit" => std::process::exit(0),
                    _ => {}
                })
                .build(app)?;

            // Auto-start daemon
            thread::spawn(|| {
                thread::sleep(Duration::from_millis(600));
                let binary = find_lokadev_binary();
                let _ = Command::new(&binary)
                    .arg("daemon")
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn();
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            list_projects,
            run_lokadev,
            start_daemon,
            list_services,
            control_service,
            get_logs,
            load_settings,
            save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running LokaDev desktop app");
}
