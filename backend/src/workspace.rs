use std::collections::VecDeque;
use std::fs;
use std::path::{Component, Path, PathBuf};

use crate::contracts::{
    WorkspaceEntry, WorkspaceReadRequest, WorkspaceReadResponse, WorkspaceScanRequest,
    WorkspaceScanResponse,
};
use crate::error::{BackendError, BackendResult};

const DEFAULT_MAX_DEPTH: usize = 4;
const DEFAULT_MAX_ENTRIES: usize = 600;
const DEFAULT_MAX_BYTES: usize = 128 * 1024;

const IGNORED_DIRS: &[&str] = &[
    ".git",
    "node_modules",
    "target",
    "dist",
    "build",
    ".next",
    ".turbo",
];

const SENSITIVE_NAMES: &[&str] = &[
    ".env",
    "id_rsa",
    "credentials.json",
];

const SENSITIVE_EXTENSIONS: &[&str] = &[
    ".pem",
    ".key",
    ".p12",
    ".sqlite",
    ".db",
];

fn normalize_root(root_path: &str) -> BackendResult<PathBuf> {
    let root = PathBuf::from(root_path);
    let canonical = root
        .canonicalize()
        .map_err(|err| BackendError::Workspace(format!("invalid root path: {err}")))?;

    if !canonical.is_dir() {
        return Err(BackendError::Workspace("root path is not a directory".into()));
    }

    Ok(canonical)
}

fn ensure_safe_relative_path(relative_path: &str) -> BackendResult<PathBuf> {
    let path = Path::new(relative_path);

    if path.is_absolute() {
        return Err(BackendError::Workspace("absolute relative_path is not allowed".into()));
    }

    for component in path.components() {
        if matches!(component, Component::ParentDir | Component::RootDir | Component::Prefix(_)) {
            return Err(BackendError::Workspace("path traversal is not allowed".into()));
        }
    }

    Ok(path.to_path_buf())
}

fn path_to_relative(root: &Path, path: &Path) -> BackendResult<String> {
    let relative = path
        .strip_prefix(root)
        .map_err(|err| BackendError::Workspace(format!("failed to strip root prefix: {err}")))?;

    Ok(relative.to_string_lossy().replace('\\', "/"))
}

fn is_ignored_dir(name: &str) -> bool {
    IGNORED_DIRS.iter().any(|ignored| ignored.eq_ignore_ascii_case(name))
}

pub fn is_sensitive_file(name: &str) -> bool {
    let lower = name.to_lowercase();

    SENSITIVE_NAMES
        .iter()
        .any(|item| item.eq_ignore_ascii_case(&lower))
        || SENSITIVE_EXTENSIONS
            .iter()
            .any(|extension| lower.ends_with(extension))
}

pub fn scan_workspace(request: WorkspaceScanRequest) -> BackendResult<WorkspaceScanResponse> {
    let root = normalize_root(&request.root_path)?;
    let max_depth = request.max_depth.unwrap_or(DEFAULT_MAX_DEPTH);
    let max_entries = request.max_entries.unwrap_or(DEFAULT_MAX_ENTRIES);
    let mut entries = Vec::new();
    let mut queue = VecDeque::from([(root.clone(), 0usize)]);
    let mut truncated = false;

    while let Some((current, depth)) = queue.pop_front() {
        if depth > max_depth {
            continue;
        }

        let read_dir = match fs::read_dir(&current) {
            Ok(read_dir) => read_dir,
            Err(_) => continue,
        };

        for item in read_dir.flatten() {
            if entries.len() >= max_entries {
                truncated = true;
                break;
            }

            let path = item.path();
            let metadata = match item.metadata() {
                Ok(metadata) => metadata,
                Err(_) => continue,
            };
            let name = item.file_name().to_string_lossy().to_string();
            let is_dir = metadata.is_dir();
            let ignored = is_dir && is_ignored_dir(&name);
            let sensitive = !is_dir && is_sensitive_file(&name);
            let relative_path = path_to_relative(&root, &path)?;

            entries.push(WorkspaceEntry {
                name,
                relative_path,
                is_dir,
                size: if metadata.is_file() { Some(metadata.len()) } else { None },
                ignored,
                sensitive,
            });

            if is_dir && !ignored && depth < max_depth {
                queue.push_back((path, depth + 1));
            }
        }

        if truncated {
            break;
        }
    }

    Ok(WorkspaceScanResponse {
        root_path: root.to_string_lossy().to_string(),
        entries,
        truncated,
    })
}

pub fn read_workspace_file(request: WorkspaceReadRequest) -> BackendResult<WorkspaceReadResponse> {
    let root = normalize_root(&request.root_path)?;
    let relative = ensure_safe_relative_path(&request.relative_path)?;
    let full_path = root.join(&relative);
    let canonical = full_path
        .canonicalize()
        .map_err(|err| BackendError::Workspace(format!("invalid file path: {err}")))?;

    if !canonical.starts_with(&root) {
        return Err(BackendError::Workspace("path escaped workspace root".into()));
    }

    if !canonical.is_file() {
        return Err(BackendError::Workspace("path is not a file".into()));
    }

    let name = canonical
        .file_name()
        .map(|name| name.to_string_lossy().to_string())
        .unwrap_or_default();
    let sensitive = is_sensitive_file(&name);

    if sensitive {
        return Err(BackendError::Workspace("sensitive file requires explicit approval flow".into()));
    }

    let max_bytes = request.max_bytes.unwrap_or(DEFAULT_MAX_BYTES);
    let bytes = fs::read(&canonical)
        .map_err(|err| BackendError::Workspace(format!("failed to read file: {err}")))?;
    let truncated = bytes.len() > max_bytes;
    let slice = if truncated { &bytes[..max_bytes] } else { &bytes };
    let content = String::from_utf8_lossy(slice).to_string();

    Ok(WorkspaceReadResponse {
        relative_path: request.relative_path,
        content,
        bytes_read: slice.len(),
        truncated,
        sensitive,
    })
}

#[cfg(test)]
mod tests {
    use super::{ensure_safe_relative_path, is_sensitive_file};

    #[test]
    fn rejects_path_traversal() {
        assert!(ensure_safe_relative_path("../secret.txt").is_err());
    }

    #[test]
    fn detects_sensitive_files() {
        assert!(is_sensitive_file(".env"));
        assert!(is_sensitive_file("prod.pem"));
        assert!(!is_sensitive_file("README.md"));
    }
}
