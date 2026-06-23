//! macOS-specific Tauri setup (dock, reopen).

use tauri::App;

pub fn setup(app: &mut App) -> tauri::Result<()> {
    app.set_activation_policy(tauri::ActivationPolicy::Regular);
    Ok(())
}
