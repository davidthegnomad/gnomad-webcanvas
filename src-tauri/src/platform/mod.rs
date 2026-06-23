//! Platform-specific startup and runtime hooks.

use tauri::{App, AppHandle, RunEvent};

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "linux")]
mod linux;

pub fn setup(app: &mut App) -> tauri::Result<()> {
    #[cfg(target_os = "macos")]
    macos::setup(app)?;
    #[cfg(target_os = "linux")]
    linux::setup(app)?;
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
