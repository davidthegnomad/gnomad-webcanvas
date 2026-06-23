//! Linux-specific Tauri setup (Wayland / single-window focus).

use tauri::{App, Manager};

pub fn setup(app: &mut App) -> tauri::Result<()> {
    let session = std::env::var("XDG_SESSION_TYPE").unwrap_or_else(|_| "unknown".into());
    let desktop = std::env::var("XDG_CURRENT_DESKTOP").unwrap_or_else(|_| "unknown".into());
    log::info!("Linux platform init — session={session}, desktop={desktop}");

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.center();
        if session.eq_ignore_ascii_case("wayland") {
            log::info!(
                "Wayland session: if WebKit shows a blank window, launch with \
                 GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1"
            );
        }
    }

    Ok(())
}
