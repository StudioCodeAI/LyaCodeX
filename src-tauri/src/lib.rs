use lyacodex_ii_backend::commands;
use lyacodex_ii_backend::{
    ChatRequest, ChatResponse, KeyMetadata, LocalEngineStatus, ProviderCheck, ProviderDescriptor,
    RuntimeStatus, SkillCatalogSearchRequest, SkillCatalogSearchResponse, SkillContentRequest,
    SkillContentResponse, WakeRitual, WorkspaceReadRequest, WorkspaceReadResponse,
    WorkspaceScanRequest, WorkspaceScanResponse,
};

fn to_tauri_error(err: lyacodex_ii_backend::BackendError) -> String {
    err.to_string()
}

#[tauri::command]
fn lyacodex_runtime_status() -> Result<RuntimeStatus, String> {
    commands::runtime_status().map_err(to_tauri_error)
}

#[tauri::command]
fn lyacodex_wake_ritual() -> Result<WakeRitual, String> {
    commands::wake_ritual().map_err(to_tauri_error)
}

#[tauri::command]
fn lyacodex_list_providers() -> Result<Vec<ProviderDescriptor>, String> {
    commands::backend_list_providers().map_err(to_tauri_error)
}

#[tauri::command]
fn lyacodex_check_provider(
    provider_id: String,
    key_ref: Option<String>,
    base_url: Option<String>,
) -> Result<ProviderCheck, String> {
    commands::backend_check_provider(provider_id, key_ref, base_url).map_err(to_tauri_error)
}

#[tauri::command]
fn lyacodex_save_secret(
    provider_id: String,
    label: String,
    secret: String,
) -> Result<KeyMetadata, String> {
    commands::backend_save_secret(provider_id, label, secret).map_err(to_tauri_error)
}

#[tauri::command]
fn lyacodex_delete_secret(key_ref: String) -> Result<(), String> {
    commands::backend_delete_secret(key_ref).map_err(to_tauri_error)
}

#[tauri::command]
fn lyacodex_test_secret(key_ref: String) -> Result<bool, String> {
    commands::backend_test_secret(key_ref).map_err(to_tauri_error)
}

#[tauri::command]
async fn lyacodex_chat_once(request: ChatRequest) -> Result<ChatResponse, String> {
    commands::backend_chat_once(request)
        .await
        .map_err(to_tauri_error)
}

#[tauri::command]
async fn lyacodex_inspect_local_engines() -> Result<LocalEngineStatus, String> {
    commands::backend_inspect_local_engines()
        .await
        .map_err(to_tauri_error)
}

#[tauri::command]
async fn lyacodex_search_skills(
    request: SkillCatalogSearchRequest,
) -> Result<SkillCatalogSearchResponse, String> {
    commands::backend_search_skills(request)
        .await
        .map_err(to_tauri_error)
}

#[tauri::command]
async fn lyacodex_fetch_skill_content(
    request: SkillContentRequest,
) -> Result<SkillContentResponse, String> {
    commands::backend_fetch_skill_content(request)
        .await
        .map_err(to_tauri_error)
}

#[tauri::command]
fn lyacodex_scan_workspace(
    request: WorkspaceScanRequest,
) -> Result<WorkspaceScanResponse, String> {
    commands::backend_scan_workspace(request).map_err(to_tauri_error)
}

#[tauri::command]
fn lyacodex_read_workspace_file(
    request: WorkspaceReadRequest,
) -> Result<WorkspaceReadResponse, String> {
    commands::backend_read_workspace_file(request).map_err(to_tauri_error)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            lyacodex_runtime_status,
            lyacodex_wake_ritual,
            lyacodex_list_providers,
            lyacodex_check_provider,
            lyacodex_save_secret,
            lyacodex_delete_secret,
            lyacodex_test_secret,
            lyacodex_chat_once,
            lyacodex_inspect_local_engines,
            lyacodex_search_skills,
            lyacodex_fetch_skill_content,
            lyacodex_scan_workspace,
            lyacodex_read_workspace_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running LyaCodex II desktop runtime");
}
