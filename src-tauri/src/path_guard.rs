//! Restrict IPC file reads to user-accessible locations.

use std::path::{Path, PathBuf};

const BLOCKED_PREFIXES: &[&str] = &["/etc", "/proc", "/sys", "/dev", "/run/systemd"];

const ALLOWED_MOUNT_PREFIXES: &[&str] = &[
    "/tmp",
    "/var/tmp",
    "/mnt",
    "/media",
    "/run/media",
    "/run/user",
];

/// Resolve and validate a path for `read_text_file_path`.
pub fn validate_user_readable_path(path: &Path) -> Result<PathBuf, String> {
    if !path.is_absolute() {
        return Err("Only absolute file paths are allowed.".to_string());
    }

    let canonical = path
        .canonicalize()
        .map_err(|e| format!("Could not resolve path: {e}"))?;

    if !canonical.is_file() {
        return Err("Path is not a regular file.".to_string());
    }

    let path_str = canonical.to_string_lossy();
    for prefix in BLOCKED_PREFIXES {
        if path_str == *prefix || path_str.starts_with(&format!("{prefix}/")) {
            return Err("Access to system paths is not allowed.".to_string());
        }
    }

    if let Some(home) = home_dir() {
        if let Ok(home_canon) = home.canonicalize() {
            if canonical.starts_with(&home_canon) {
                return Ok(canonical);
            }
        }
    }

    for prefix in ALLOWED_MOUNT_PREFIXES {
        if path_str == *prefix || path_str.starts_with(&format!("{prefix}/")) {
            return Ok(canonical);
        }
    }

    Err("Path is outside allowed user directories (home, /tmp, /mnt, /media).".to_string())
}

fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME").map(PathBuf::from)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;

    #[test]
    fn rejects_relative_paths() {
        let err = validate_user_readable_path(Path::new("relative.html")).unwrap_err();
        assert!(err.contains("absolute"));
    }

    #[test]
    fn rejects_blocked_system_paths() {
        let err = validate_user_readable_path(Path::new("/etc/passwd")).unwrap_err();
        assert!(err.contains("system") || err.contains("Could not resolve"));
    }

    #[test]
    fn allows_file_under_home() {
        let home = home_dir().expect("HOME should be set in test env");
        let dir = home.join(".gnomad-webcanvas-test");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).expect("mkdir");
        let file = dir.join("sample.html");
        fs::File::create(&file)
            .and_then(|mut f| f.write_all(b"<html></html>"))
            .expect("write");
        let resolved = validate_user_readable_path(&file).expect("home file allowed");
        assert!(resolved.ends_with("sample.html"));
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn allows_file_under_tmp() {
        let file = PathBuf::from(format!(
            "/tmp/gnomad-webcanvas-path-test-{}.html",
            std::process::id()
        ));
        fs::File::create(&file)
            .and_then(|mut f| f.write_all(b"<html></html>"))
            .expect("write");
        let resolved = validate_user_readable_path(&file).expect("tmp file allowed");
        assert!(resolved.to_string_lossy().contains("gnomad-webcanvas-path-test"));
        let _ = fs::remove_file(&file);
    }
}
