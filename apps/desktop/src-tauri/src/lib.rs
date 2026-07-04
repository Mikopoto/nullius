use std::net::TcpStream;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::Duration;

#[tauri::command]
fn ensure_local_server(port: u16) -> Result<String, String> {
    if server_is_running(port) {
        return Ok(format!("server already running on 127.0.0.1:{port}"));
    }
    let root = find_repo_root().ok_or_else(|| "Could not locate Nullius repo root containing packages/cli/dist/index.js".to_string())?;
    let cli = root.join("packages").join("cli").join("dist").join("index.js");
    Command::new("node")
        .arg(cli)
        .arg("serve")
        .arg("--port")
        .arg(port.to_string())
        .current_dir(&root)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| format!("Failed to start Nullius server: {error}"))?;
    Ok(format!("server starting on 127.0.0.1:{port}"))
}

fn server_is_running(port: u16) -> bool {
    TcpStream::connect_timeout(&format!("127.0.0.1:{port}").parse().expect("valid loopback address"), Duration::from_millis(150)).is_ok()
}

fn find_repo_root() -> Option<PathBuf> {
    if let Ok(root) = std::env::var("NULLIUS_REPO_ROOT") {
        let path = PathBuf::from(root);
        if cli_exists(&path) {
            return Some(path);
        }
    }
    let mut starts = Vec::new();
    if let Ok(cwd) = std::env::current_dir() {
        starts.push(cwd);
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            starts.push(parent.to_path_buf());
        }
    }
    for start in starts {
        for ancestor in start.ancestors() {
            if cli_exists(ancestor) {
                return Some(ancestor.to_path_buf());
            }
        }
    }
    None
}

fn cli_exists(root: &Path) -> bool {
    root.join("packages").join("cli").join("dist").join("index.js").is_file()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![ensure_local_server])
        .run(tauri::generate_context!())
        .expect("error while running Nullius");
}
