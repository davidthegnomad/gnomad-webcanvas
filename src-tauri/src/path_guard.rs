//! Restrict IPC file reads/writes to user-accessible locations.

use std::path::{Component, Path, PathBuf};

const MAX_PATH_LEN: usize = 4096;

#[cfg(unix)]
const BLOCKED_UNIX_PREFIXES: &[&str] = &["/etc", "/proc", "/sys", "/dev", "/run/systemd"];

#[cfg(unix)]
const ALLOWED_UNIX_MOUNT_PREFIXES: &[&str] = &[
    "/tmp",
    "/var/tmp",
    "/mnt",
    "/media",
    "/run/media",
    "/run/user",
];

#[cfg(windows)]
const BLOCKED_WIN_COMPONENTS: &[&str] = &[
    "windows",
    "program files",
    "program files (x86)",
    "programdata",
    "$recycle.bin",
    "system volume information",
];

pub(crate) fn reject_null_bytes(path: &str) -> Result<(), String> {
    if path.contains('\0') {
        return Err("Path contains invalid null bytes.".to_string());
    }
    if path.len() > MAX_PATH_LEN {
        return Err("Path is too long.".to_string());
    }
    Ok(())
}

/// True when `path` is `base` or a child path (component-wise, not string prefix).
fn path_is_within_base(path: &Path, base: &Path) -> bool {
    let mut path_iter = path.components();
    for base_comp in base.components() {
        match path_iter.next() {
            Some(path_comp) if path_comp == base_comp => {}
            _ => return false,
        }
    }
    true
}

fn canonicalize_existing(path: &Path) -> Result<PathBuf, String> {
    if !path.is_absolute() {
        return Err("Only absolute file paths are allowed.".to_string());
    }
    path.canonicalize()
        .map_err(|_| "Could not access the requested path.".to_string())
}

#[cfg(unix)]
fn is_blocked_system_path(path: &Path) -> bool {
    let path_str = path.to_string_lossy();
    BLOCKED_UNIX_PREFIXES.iter().any(|prefix| {
        path_str == *prefix || path_str.starts_with(&format!("{prefix}/"))
    })
}

#[cfg(windows)]
fn is_blocked_system_path(path: &Path) -> bool {
    path.components().any(|comp| {
        if let Component::Normal(name) = comp {
            let lower = name.to_string_lossy().to_ascii_lowercase();
            return BLOCKED_WIN_COMPONENTS
                .iter()
                .any(|blocked| lower == *blocked);
        }
        false
    })
}

#[cfg(unix)]
fn is_allowed_user_path(canonical: &Path) -> bool {
    if is_blocked_system_path(canonical) {
        return false;
    }

    if let Some(home) = dirs::home_dir() {
        if let Ok(home_canon) = home.canonicalize() {
            if path_is_within_base(canonical, &home_canon) {
                return true;
            }
        }
    }

    if let Ok(temp_canon) = std::env::temp_dir().canonicalize() {
        if path_is_within_base(canonical, &temp_canon) {
            return true;
        }
    }

    let path_str = canonical.to_string_lossy();
    ALLOWED_UNIX_MOUNT_PREFIXES.iter().any(|prefix| {
        path_str == *prefix || path_str.starts_with(&format!("{prefix}/"))
    })
}

#[cfg(windows)]
fn is_allowed_user_path(canonical: &Path) -> bool {
    if is_blocked_system_path(canonical) {
        return false;
    }

    if let Some(home) = dirs::home_dir() {
        if let Ok(home_canon) = home.canonicalize() {
            if path_is_within_base(canonical, &home_canon) {
                return true;
            }
        }
    }

    if let Ok(temp_canon) = std::env::temp_dir().canonicalize() {
        if path_is_within_base(canonical, &temp_canon) {
            return true;
        }
    }

    // Secondary drives (e.g. D:\projects) — allowed when no blocked components appear.
    let first = canonical.components().next();
    matches!(first, Some(Component::Prefix(_)))
}

fn extension_allowed(path: &Path, allowed: &[&str]) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|ext| {
            let lower = ext.to_ascii_lowercase();
            allowed.iter().any(|a| *a == lower.as_str())
        })
        .unwrap_or(false)
}

/// Resolve and validate a path for `read_text_file_path` (open + metadata happen in the command).
pub fn validate_user_readable_path(path: &Path) -> Result<PathBuf, String> {
    reject_null_bytes(&path.to_string_lossy())?;
    let canonical = canonicalize_existing(path)?;

    if !extension_allowed(&canonical, READABLE_EXTENSIONS) {
        return Err("File extension is not allowed for read.".to_string());
    }

    if !is_allowed_user_path(&canonical) {
        return Err("Path is outside allowed user directories.".to_string());
    }

    Ok(canonical)
}

/// Validate a destination path for guarded writes (parent directory must exist).
pub fn validate_user_writable_path(
    path: &Path,
    allowed_extensions: &[&str],
) -> Result<PathBuf, String> {
    reject_null_bytes(&path.to_string_lossy())?;
    if !path.is_absolute() {
        return Err("Only absolute file paths are allowed.".to_string());
    }

    let file_name = path
        .file_name()
        .ok_or_else(|| "Path has no file name.".to_string())?;

    if !extension_allowed(path, allowed_extensions) {
        return Err(format!(
            "File extension not allowed for write (allowed: {}).",
            allowed_extensions.join(", ")
        ));
    }

    let parent = path
        .parent()
        .ok_or_else(|| "Path has no parent directory.".to_string())?;
    let parent_canon = parent
        .canonicalize()
        .map_err(|_| "Parent directory does not exist.".to_string())?;

    if !is_allowed_user_path(&parent_canon) {
        return Err("Path is outside allowed user directories.".to_string());
    }

    let target = parent_canon.join(file_name);
    if is_blocked_system_path(&target) {
        return Err("Path is not allowed.".to_string());
    }

    Ok(target)
}

pub const READABLE_EXTENSIONS: &[&str] = &["html", "htm", "txt", "css", "js", "md"];
pub const TEXT_WRITE_EXTENSIONS: &[&str] = &["html", "htm", "css", "js", "md"];
pub const BINARY_WRITE_EXTENSIONS: &[&str] = &["zip"];

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;

    #[test]
    fn path_is_within_base_rejects_prefix_confusion() {
        let base = PathBuf::from(if cfg!(windows) {
            r"C:\Users\Alice"
        } else {
            "/home/alice"
        });
        let sibling = PathBuf::from(if cfg!(windows) {
            r"C:\Users\AliceMalicious\file.html"
        } else {
            "/home/aliceevil/file.html"
        });
        assert!(!path_is_within_base(&sibling, &base));
    }

    #[test]
    fn rejects_relative_paths() {
        let err = validate_user_readable_path(Path::new("relative.html")).unwrap_err();
        assert!(err.contains("absolute") || err.contains("access"));
    }

    #[test]
    fn rejects_null_bytes() {
        let err = validate_user_readable_path(Path::new("/tmp/bad\0.html")).unwrap_err();
        assert!(err.contains("null"));
    }

    #[cfg(unix)]
    #[test]
    fn rejects_blocked_system_paths() {
        let err = validate_user_readable_path(Path::new("/etc/passwd")).unwrap_err();
        assert!(!err.is_empty());
    }

    #[test]
    fn allows_file_under_home() {
        let home = dirs::home_dir().expect("home dir should be set in test env");
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

    #[cfg(unix)]
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

    #[test]
    fn write_rejects_bad_extension() {
        let home = dirs::home_dir().expect("home");
        let target = home.join("blocked-write.exe");
        let err = validate_user_writable_path(&target, TEXT_WRITE_EXTENSIONS).unwrap_err();
        assert!(err.contains("extension"));
    }
}
