mod updater;

use std::path::{Path, PathBuf};
use std::sync::Mutex;

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, RunEvent, State};

struct PendingFiles(Mutex<Vec<String>>);

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

fn focus_main_window(app: &AppHandle) {
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

    let metadata = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    if metadata.len() > MAX_BYTES {
        return Err(format!(
            "File is too large to open ({:.1} MB; limit is 10 MB).",
            metadata.len() as f64 / (1024.0 * 1024.0)
        ));
    }

    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn take_pending_open_files(state: State<PendingFiles>) -> Result<Vec<String>, String> {
    let mut pending = state.0.lock().map_err(|e| e.to_string())?;
    Ok(std::mem::take(&mut *pending))
}

fn build_menu(app: &AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let about = MenuItem::with_id(app, "about", "About Gnomad Webcanvas", true, None::<&str>)?;
    let check_updates =
        MenuItem::with_id(app, "check_updates", "Check for Updates…", true, None::<&str>)?;

    let app_submenu = Submenu::with_items(
        app,
        "Gnomad Webcanvas",
        true,
        &[
            &about,
            &check_updates,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::services(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::hide(app, Some("Hide Gnomad Webcanvas"))?,
            &PredefinedMenuItem::hide_others(app, None)?,
            &PredefinedMenuItem::show_all(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::quit(app, Some("Quit Gnomad Webcanvas"))?,
        ],
    )?;

    let file_open = MenuItem::with_id(app, "file_open", "Open…", true, Some("CmdOrCtrl+O"))?;
    let file_save = MenuItem::with_id(app, "file_save", "Save", true, Some("CmdOrCtrl+S"))?;
    let file_save_as =
        MenuItem::with_id(app, "file_save_as", "Save As…", true, Some("CmdOrCtrl+Shift+S"))?;
    let file_export =
        MenuItem::with_id(app, "file_export", "Export ZIP…", true, Some("CmdOrCtrl+Shift+E"))?;

    let file_submenu = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &file_open,
            &PredefinedMenuItem::separator(app)?,
            &file_save,
            &file_save_as,
            &PredefinedMenuItem::separator(app)?,
            &file_export,
        ],
    )?;

    let edit_submenu = Submenu::with_items(
        app,
        "Edit",
        true,
        &[
            &PredefinedMenuItem::undo(app, None)?,
            &PredefinedMenuItem::redo(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, None)?,
            &PredefinedMenuItem::copy(app, None)?,
            &PredefinedMenuItem::paste(app, None)?,
            &PredefinedMenuItem::select_all(app, None)?,
        ],
    )?;

    let window_submenu = Submenu::with_items(
        app,
        "Window",
        true,
        &[
            &PredefinedMenuItem::minimize(app, None)?,
            &PredefinedMenuItem::maximize(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::fullscreen(app, None)?,
        ],
    )?;

    Menu::with_items(
        app,
        &[
            &app_submenu,
            &file_submenu,
            &edit_submenu,
            &window_submenu,
        ],
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(PendingFiles(Mutex::new(Vec::new())))
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
            updater::check_for_updates,
            updater::install_update,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                let _ = app.set_activation_policy(tauri::ActivationPolicy::Regular);
            }

            let menu = build_menu(app.handle())?;
            app.set_menu(menu)?;

            app.on_menu_event(|app, event| {
                if let Some(window) = app.get_webview_window("main") {
                    match event.id().0.as_str() {
                        "about" | "check_updates" => {
                            let _ = window.emit("webcanvas:show-about", ());
                        }
                        "file_open" => {
                            let _ = window.emit("webcanvas:file-open", ());
                        }
                        "file_save" => {
                            let _ = window.emit("webcanvas:file-save", ());
                        }
                        "file_save_as" => {
                            let _ = window.emit("webcanvas:file-save-as", ());
                        }
                        "file_export" => {
                            let _ = window.emit("webcanvas:file-export", ());
                        }
                        _ => {}
                    }
                }
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
                api.prevent_close();
                let _ = window.emit("window-close-requested", ());
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            #[cfg(target_os = "macos")]
            if let RunEvent::Reopen { .. } = event {
                focus_main_window(app_handle);
            }
        });
}
