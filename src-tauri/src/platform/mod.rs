//! Platform-specific startup and runtime hooks.

use tauri::{App, AppHandle, RunEvent};

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "linux")]
mod linux;

pub fn apply_linux_display_env() {
    #[cfg(target_os = "linux")]
    linux::apply_display_env();
}

pub fn setup(_app: &mut App) -> tauri::Result<()> {
    #[cfg(target_os = "macos")]
    macos::setup(_app)?;
    #[cfg(target_os = "linux")]
    linux::setup(_app)?;
    Ok(())
}

pub fn on_run_event(app_handle: &AppHandle, event: RunEvent) {
    if let RunEvent::ExitRequested { api, .. } = &event {
        api.prevent_exit();
        crate::request_close_from_frontend(app_handle);
        return;
    }

    #[cfg(target_os = "macos")]
    if let RunEvent::Reopen { .. } = event {
        crate::focus_main_window(app_handle);
    }
}
