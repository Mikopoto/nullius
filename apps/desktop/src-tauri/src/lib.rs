use serde::Serialize;
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread::sleep;
use std::time::{Duration, Instant};
use tauri::Manager;

struct ManagedServer {
    child: Child,
    port: u16,
}

struct ServerProcess(Mutex<Option<ManagedServer>>);

#[derive(Serialize)]
struct LocalServerResult {
    port: u16,
    url: String,
    message: String,
}

#[tauri::command]
fn ensure_local_server(
    port: Option<u16>,
    state: tauri::State<'_, ServerProcess>,
) -> Result<LocalServerResult, String> {
    if let Some(result) = existing_managed_server(&state) {
        return result;
    }

    let requested_port = port.unwrap_or(0);
    if requested_port != 0 && server_is_running(requested_port) {
        return Ok(local_server_result(
            requested_port,
            format!("Server already running on 127.0.0.1:{requested_port}"),
        ));
    }

    let selected_port = if requested_port == 0 {
        available_loopback_port()?
    } else {
        requested_port
    };
    let root = find_repo_root().ok_or_else(|| {
        "Could not locate Nullius repo root containing packages/cli/dist/index.js".to_string()
    })?;
    let cli = root
        .join("packages")
        .join("cli")
        .join("dist")
        .join("index.js");
    let mut child = Command::new("node")
        .arg(cli)
        .arg("serve")
        .arg("--port")
        .arg(selected_port.to_string())
        .current_dir(&root)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| format!("Failed to start Nullius server: {error}"))?;

    let deadline = Instant::now() + Duration::from_secs(5);
    loop {
        if server_is_running(selected_port) {
            let mut guard = state
                .0
                .lock()
                .map_err(|_| "Server process lock was poisoned".to_string())?;
            *guard = Some(ManagedServer {
                child,
                port: selected_port,
            });
            return Ok(local_server_result(
                selected_port,
                format!("Server ready on 127.0.0.1:{selected_port}"),
            ));
        }
        match child.try_wait() {
            Ok(Some(status)) => {
                return Err(format!(
                    "Nullius server exited before becoming ready: {status}"
                ));
            }
            Ok(None) => {}
            Err(error) => return Err(format!("Could not poll Nullius server process: {error}")),
        }
        if Instant::now() >= deadline {
            let _ = child.kill();
            let _ = child.wait();
            return Err(format!(
                "Timed out waiting for Nullius server on 127.0.0.1:{selected_port}"
            ));
        }
        sleep(Duration::from_millis(100));
    }
}

fn existing_managed_server(
    state: &tauri::State<'_, ServerProcess>,
) -> Option<Result<LocalServerResult, String>> {
    let mut guard = match state.0.lock() {
        Ok(guard) => guard,
        Err(_) => return Some(Err("Server process lock was poisoned".to_string())),
    };
    let managed = guard.as_mut()?;
    if server_is_running(managed.port) {
        return Some(Ok(local_server_result(
            managed.port,
            format!("Server already running on 127.0.0.1:{}", managed.port),
        )));
    }
    let _ = managed.child.kill();
    let _ = managed.child.wait();
    *guard = None;
    None
}

fn local_server_result(port: u16, message: String) -> LocalServerResult {
    LocalServerResult {
        port,
        url: format!("http://127.0.0.1:{port}"),
        message,
    }
}

fn available_loopback_port() -> Result<u16, String> {
    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|error| format!("Could not reserve a local server port: {error}"))?;
    listener
        .local_addr()
        .map(|addr| addr.port())
        .map_err(|error| format!("Could not inspect reserved local server port: {error}"))
}

fn server_is_running(port: u16) -> bool {
    TcpStream::connect_timeout(
        &format!("127.0.0.1:{port}")
            .parse()
            .expect("valid loopback address"),
        Duration::from_millis(150),
    )
    .is_ok()
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
    root.join("packages")
        .join("cli")
        .join("dist")
        .join("index.js")
        .is_file()
}

fn stop_managed_server(app: &tauri::AppHandle) {
    let state = app.state::<ServerProcess>();
    {
        if let Ok(mut guard) = state.0.lock() {
            if let Some(mut managed) = guard.take() {
                let _ = managed.child.kill();
                let _ = managed.child.wait();
            }
        };
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ServerProcess(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![ensure_local_server])
        .on_window_event(|window, event| {
            if matches!(event, tauri::WindowEvent::CloseRequested { .. }) {
                stop_managed_server(window.app_handle());
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Nullius");
}
