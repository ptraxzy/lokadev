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

/// Fetch all projects from the LokaDev daemon REST API
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

/// Execute a lokadev CLI command (start, stop, restart, create, delete ...)
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

/// Start the LokaDev daemon in the background
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

fn find_lokadev_binary() -> String {
    for candidate in &[
        "/usr/local/bin/lokadev",
        "/usr/bin/lokadev",
        "lokadev",
    ] {
        if std::path::Path::new(candidate).exists() {
            return candidate.to_string();
        }
    }
    "lokadev".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // ── System tray menu ──────────────────────────────────
            let show      = MenuItemBuilder::with_id("show",      "Show LokaDev").build(app)?;
            let dashboard = MenuItemBuilder::with_id("dashboard", "Open Dashboard").build(app)?;
            let sep       = PredefinedMenuItem::separator(app)?;
            let quit      = MenuItemBuilder::with_id("quit",      "Quit LokaDev").build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&show)
                .item(&dashboard)
                .item(&sep)
                .item(&quit)
                .build()?;

            // ── Tray icon ─────────────────────────────────────────
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .menu_on_left_click(false)
                .tooltip("LokaDev")
                .on_tray_icon_event(|tray, event| {
                    // Left-click toggles the window
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

            // ── Auto-start daemon ─────────────────────────────────
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
            // Close button → hide to tray instead of quitting
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            list_projects,
            run_lokadev,
            start_daemon,
        ])
        .run(tauri::generate_context!())
        .expect("error while running LokaDev desktop app");
}
