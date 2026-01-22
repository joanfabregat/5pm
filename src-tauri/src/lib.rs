use tauri::menu::{AboutMetadata, Menu, PredefinedMenuItem, Submenu};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle();

            let about_metadata = AboutMetadata {
                name: Some("6pm".into()),
                version: Some("0.1.0".into()),
                comments: Some("A minimalist countdown timer".into()),
                copyright: Some("© Joan Fabrégat\njoan@fabreg.at • joanfabregat.com".into()),
                ..Default::default()
            };

            // Build custom app menu with "6pm" as the name
            let app_menu = Submenu::with_items(
                handle,
                "6pm",
                true,
                &[
                    &PredefinedMenuItem::about(handle, Some("About 6pm"), Some(about_metadata))?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::services(handle, None)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::hide(handle, Some("Hide 6pm"))?,
                    &PredefinedMenuItem::hide_others(handle, None)?,
                    &PredefinedMenuItem::show_all(handle, None)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::quit(handle, Some("Quit 6pm"))?,
                ],
            )?;

            let file_menu = Submenu::with_items(
                handle,
                "File",
                true,
                &[&PredefinedMenuItem::close_window(handle, Some("Close"))?],
            )?;

            let edit_menu = Submenu::with_items(
                handle,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(handle, None)?,
                    &PredefinedMenuItem::redo(handle, None)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::cut(handle, None)?,
                    &PredefinedMenuItem::copy(handle, None)?,
                    &PredefinedMenuItem::paste(handle, None)?,
                    &PredefinedMenuItem::select_all(handle, None)?,
                ],
            )?;

            let view_menu = Submenu::with_items(
                handle,
                "View",
                true,
                &[&PredefinedMenuItem::fullscreen(handle, None)?],
            )?;

            let window_menu = Submenu::with_items(
                handle,
                "Window",
                true,
                &[
                    &PredefinedMenuItem::minimize(handle, None)?,
                    &PredefinedMenuItem::maximize(handle, None)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::close_window(handle, None)?,
                ],
            )?;

            let menu = Menu::with_items(
                handle,
                &[&app_menu, &file_menu, &edit_menu, &view_menu, &window_menu],
            )?;

            app.set_menu(menu)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
