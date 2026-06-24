//! Linux-specific Tauri setup (Wayland / single-window focus).

use tauri::{App, Manager};

/// KDE/Plasma may force `GDK_BACKEND=wayland` even when `.desktop` sets `env GDK_BACKEND=x11`.
/// Call before Tauri/GTK init on Wayland sessions.
pub fn apply_display_env() {
    let session = std::env::var("XDG_SESSION_TYPE").unwrap_or_default();
    if !session.eq_ignore_ascii_case("wayland") {
        return;
    }
    std::env::set_var("GDK_BACKEND", "x11");
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    log::info!("Wayland session: forced GDK_BACKEND=x11 for WebKitGTK");
}

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
