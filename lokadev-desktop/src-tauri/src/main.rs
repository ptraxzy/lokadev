// Prevents additional console window on Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, Window,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub name: String,
    pub dir: String,
    pub domain: String,
    pub runtime: String,
    pub server: String,
    pub database: String,
    pub status: String,
    pub pids: Vec<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DaemonStatus {
    pub running: bool,
    pub projects: Vec<Project>,
}

/// Fetch projects from the LokaDev daemon API
#[tauri::command]
async fn list_projects() -> Result<Vec<Project>, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get("http://localhost:25000/api/projects")
        .send()
        .await
        .map_err(|e| format!("Daemon not running: {}", e))?;

    let projects: Vec<Project> = resp.json().await.map_err(|e| e.to_string())?;
    Ok(projects)
}

/// Run a lokadev CLI command (start, stop, restart, delete, create)
#[tauri::command]
async fn run_lokadev(args: Vec<String>) -> Result<String, String> {
    // Try /usr/local/bin/lokadev first, then fall back to PATH
    let binary = which_lokadev();

    let output = Command::new(&binary)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to run lokadev: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(if stderr.is_empty() { stdout } else { stderr })
    }
}

/// Start the LokaDev daemon in background
#[tauri::command]
async fn start_daemon() -> Result<(), String> {
    let binary = which_lokadev();
    Command::new(&binary)
        .arg("daemon")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("Could not start daemon: {}", e))?;
    Ok(())
}

fn which_lokadev() -> String {
    for path in &[
        "/usr/local/bin/lokadev",
        "/usr/bin/lokadev",
        "lokadev",
    ] {
        if std::path::Path::new(path).exists() {
            return path.to_string();
        }
    }
    "lokadev".to_string()
}

fn build_tray_menu() -> SystemTrayMenu {
    let show    = CustomMenuItem::new("show".to_string(),      "Show LokaDev");
    let dash    = CustomMenuItem::new("dashboard".to_string(), "Open Dashboard");
    let sep1    = SystemTrayMenuItem::Separator;
    let new_p   = CustomMenuItem::new("new_project".to_string(), "New Project...");
    let sep2    = SystemTrayMenuItem::Separator;
    let quit    = CustomMenuItem::new("quit".to_string(),      "Quit LokaDev");

    SystemTrayMenu::new()
        .add_item(show)
        .add_item(dash)
        .add_native_item(sep1)
        .add_item(new_p)
        .add_native_item(sep2)
        .add_item(quit)
}

fn main() {
    let tray = SystemTray::new().with_menu(build_tray_menu());

    tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let w = app.get_window("main").unwrap();
                if w.is_visible().unwrap_or(false) {
                    let _ = w.hide();
                } else {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show" => {
                    let w = app.get_window("main").unwrap();
                    let _ = w.show();
                    let _ = w.set_focus();
                }
                "dashboard" => {
                    let _ = tauri::api::shell::open(
                        &app.shell_scope(),
                        "http://localhost:25000",
                        None,
                    );
                }
                "new_project" => {
                    let w = app.get_window("main").unwrap();
                    let _ = w.show();
                    let _ = w.set_focus();
                    let _ = w.emit("nav-to", "new_project");
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| {
            // Hide to tray instead of quitting when user closes window
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                event.window().hide().unwrap();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            list_projects,
            run_lokadev,
            start_daemon,
        ])
        .setup(|app| {
            // Auto-start daemon when app launches
            let _handle = app.handle();
            thread::spawn(|| {
                thread::sleep(Duration::from_millis(800));
                let binary = which_lokadev();
                let _ = Command::new(&binary)
                    .arg("daemon")
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
