mod menu;
mod path_guard;
mod platform;
mod updater;

use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;

use tauri::{AppHandle, Emitter, Manager, State, WebviewWindow};

struct PendingFiles(Mutex<Vec<String>>);

/// When false, CloseRequested is intercepted for unsaved-changes flow.
struct CloseGate(AtomicBool);

pub(crate) fn request_close_from_frontend(app: &AppHandle) {
    let gate = app.state::<CloseGate>();
    if gate.0.load(Ordering::SeqCst) {
        app.exit(0);
        return;
    }

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.emit("window-close-requested", ());
    } else {
        app.exit(0);
    }
}

#[tauri::command]
fn finish_close(window: WebviewWindow, app: AppHandle, gate: State<CloseGate>) -> Result<(), String> {
    gate.0.store(true, Ordering::SeqCst);
    window.close().map_err(|e| e.to_string())?;
    if app.webview_windows().is_empty() {
        app.exit(0);
    }
    Ok(())
}

fn collect_paths_from_args<I, S>(args: I) -> Vec<PathBuf>
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let mut files = Vec::new();

    for arg in args {
        let maybe_file = arg.as_ref();
        if maybe_file.starts_with('-') {
            continue;
        }

        if let Ok(url) = url::Url::parse(maybe_file) {
            if let Ok(path) = url.to_file_path() {
                files.push(path);
                continue;
            }
        }

        let path = PathBuf::from(maybe_file);
        if path.is_file() {
            files.push(path);
        }
    }

    files
}

fn is_supported_file(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|ext| {
            matches!(
                ext.to_ascii_lowercase().as_str(),
                "html" | "htm" | "txt" | "css" | "js" | "md"
            )
        })
        .unwrap_or(false)
}

pub(crate) fn focus_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn emit_open_file(app: &AppHandle, path: &Path) {
    if !is_supported_file(path) {
        return;
    }
    let _ = app.emit(
        "webcanvas:open-file",
        path.to_string_lossy().to_string(),
    );
    focus_main_window(app);
}

fn queue_or_emit_files(app: &AppHandle, paths: Vec<PathBuf>, pending: &State<PendingFiles>) {
    let supported: Vec<String> = paths
        .into_iter()
        .filter(|p| is_supported_file(p))
        .map(|p| p.to_string_lossy().to_string())
        .collect();

    if supported.is_empty() {
        return;
    }

    if app.webview_windows().is_empty() {
        let mut pending_files = pending.0.lock().expect("pending files lock");
        pending_files.extend(supported);
        return;
    }

    if supported.len() == 1 {
        emit_open_file(app, Path::new(&supported[0]));
    } else {
        let _ = app.emit("webcanvas:pending-files", supported);
    }
}

#[tauri::command]
fn read_text_file_path(path: String) -> Result<String, String> {
    const MAX_BYTES: u64 = 10 * 1024 * 1024;

    let path_buf = path_guard::validate_user_readable_path(Path::new(&path))?;

    let metadata = std::fs::metadata(&path_buf).map_err(|e| e.to_string())?;
    if metadata.len() > MAX_BYTES {
        return Err(format!(
            "File is too large to open ({:.1} MB; limit is 10 MB).",
            metadata.len() as f64 / (1024.0 * 1024.0)
        ));
    }

    std::fs::read_to_string(&path_buf).map_err(|e| e.to_string())
}

#[tauri::command]
fn take_pending_open_files(state: State<PendingFiles>) -> Result<Vec<String>, String> {
    let mut pending = state.0.lock().map_err(|e| e.to_string())?;
    Ok(std::mem::take(&mut *pending))
}

fn handle_menu_event(app: &AppHandle, event_id: &str) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };

    let event_name = match event_id {
        "about" => Some("webcanvas:show-about"),
        "check_updates" => Some("webcanvas:check-updates"),
        "file_open" => Some("webcanvas:file-open"),
        "file_save" => Some("webcanvas:file-save"),
        "file_save_as" => Some("webcanvas:file-save-as"),
        "file_export" => Some("webcanvas:file-export"),
        "file_close" => Some("webcanvas:file-close"),
        _ => None,
    };

    if let Some(name) = event_name {
        let _ = window.emit(name, ());
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    platform::apply_linux_display_env();

    tauri::Builder::default()
        .manage(PendingFiles(Mutex::new(Vec::new())))
        .manage(CloseGate(AtomicBool::new(false)))
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            let files = collect_paths_from_args(argv);
            if files.is_empty() {
                focus_main_window(app);
                return;
            }
            if let Some(pending) = app.try_state::<PendingFiles>() {
                queue_or_emit_files(app, files, &pending);
            }
        }))
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            read_text_file_path,
            take_pending_open_files,
            finish_close,
            updater::check_for_updates,
            updater::install_update,
        ])
        .setup(|app| {
            platform::setup(app)?;

            let menu = menu::build_menu(app.handle())?;
            app.set_menu(menu)?;

            app.on_menu_event(|app, event| {
                handle_menu_event(app, event.id().0.as_str());
            });

            let startup_files = collect_paths_from_args(std::env::args().skip(1));
            if !startup_files.is_empty() {
                let pending = app.state::<PendingFiles>();
                queue_or_emit_files(app.handle(), startup_files, &pending);
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let gate = window.state::<CloseGate>();
                if gate.0.load(Ordering::SeqCst) {
                    return;
                }
                api.prevent_close();
                let _ = window.emit("window-close-requested", ());
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            platform::on_run_event(app_handle, event);
        });
}
