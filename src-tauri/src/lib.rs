use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

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

fn emit_open_file(app: &AppHandle, path: &Path) {
    if !is_supported_file(path) {
        return;
    }
    let _ = app.emit(
        "webcanvas:open-file",
        path.to_string_lossy().to_string(),
    );
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_focus();
        let _ = window.unminimize();
    }
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

/// Reads a UTF-8 text file from an arbitrary path the user picked via the native
/// open dialog or an OS "open with" association. This intentionally uses `std::fs`
/// directly — bypassing the scoped fs plugin — so users can open files from anywhere
/// on disk, which is the whole point of a desktop editor. The size cap keeps a huge
/// file from freezing the Monaco editor on the frontend.
#[tauri::command]
fn read_text_file_path(path: String) -> Result<String, String> {
    const MAX_BYTES: u64 = 10 * 1024 * 1024; // 10 MB

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(PendingFiles(Mutex::new(Vec::new())))
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            let files = collect_paths_from_args(argv);
            if files.is_empty() {
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
        .invoke_handler(tauri::generate_handler![
            read_text_file_path,
            take_pending_open_files
        ])
        .setup(|app| {
            let startup_files = collect_paths_from_args(std::env::args().skip(1));
            if !startup_files.is_empty() {
                let pending = app.state::<PendingFiles>();
                queue_or_emit_files(app.handle(), startup_files, &pending);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
