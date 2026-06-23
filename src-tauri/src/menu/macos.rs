//! macOS menu bar — App / File / Edit / Window (HIG convention).

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::AppHandle;

pub fn build_menu(app: &AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
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
    let file_close =
        MenuItem::with_id(app, "file_close", "Close Window", true, Some("CmdOrCtrl+W"))?;

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
            &file_close,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::minimize(app, None)?,
            &PredefinedMenuItem::maximize(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::fullscreen(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::bring_all_to_front(app, None)?,
        ],
    )?;

    Menu::with_items(
        app,
        &[&app_submenu, &file_submenu, &edit_submenu, &window_submenu],
    )
}
