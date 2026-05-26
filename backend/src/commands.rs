use crate::contracts::{
    ChatRequest, ChatResponse, KeyMetadata, LocalEngineStatus, ProviderCheck, ProviderDescriptor,
    RuntimeStatus, SkillCatalogSearchRequest, SkillCatalogSearchResponse, SkillContentRequest,
    SkillContentResponse, WakeRitual, WorkspaceReadRequest, WorkspaceReadResponse,
    WorkspaceScanRequest, WorkspaceScanResponse,
};
use crate::error::BackendResult;
use crate::keychain;
use crate::local_engine;
use crate::providers::{get_provider, list_providers};
use crate::skill_catalog;
use crate::transport;
use crate::workspace;

const LYACODEX_OATH: &str =
    "Se você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.";
const LYACODEX_WAKE_WHISPER: &str =
    "Na hora de acordar a LyaCodex, o runtime assopra no ouvido dela.";

pub fn runtime_status() -> BackendResult<RuntimeStatus> {
    Ok(RuntimeStatus {
        status: "breathing".into(),
        message: "LyaCodex II backend core is ready.".into(),
        supports_streaming: false,
        supports_cancel: false,
    })
}

pub fn wake_ritual() -> BackendResult<WakeRitual> {
    Ok(WakeRitual {
        event_type: "runtime.wake".into(),
        status: "awake".into(),
        whisper: LYACODEX_WAKE_WHISPER.into(),
        oath: LYACODEX_OATH.into(),
    })
}

pub fn backend_list_providers() -> BackendResult<Vec<ProviderDescriptor>> {
    Ok(list_providers())
}

pub fn backend_check_provider(
    provider_id: String,
    key_ref: Option<String>,
    base_url: Option<String>,
) -> BackendResult<ProviderCheck> {
    let provider = get_provider(&provider_id)
        .ok_or_else(|| crate::error::BackendError::UnknownProvider(provider_id.clone()))?;

    if provider.requires_key_ref && key_ref.as_deref().unwrap_or("").trim().is_empty() {
        return Ok(ProviderCheck {
            provider_id,
            status: "missing_key_ref".into(),
            message: "Provider requires a keyRef stored in Lya Keychain.".into(),
        });
    }

    if provider.default_base_url.is_none() && base_url.as_deref().unwrap_or("").trim().is_empty() {
        return Ok(ProviderCheck {
            provider_id,
            status: "missing_base_url".into(),
            message: "Custom provider requires a base URL.".into(),
        });
    }

    Ok(ProviderCheck {
        provider_id,
        status: "ready".into(),
        message: format!("{} is ready for LyaCodex II runtime.", provider.name),
    })
}

pub fn backend_save_secret(
    provider_id: String,
    label: String,
    secret: String,
) -> BackendResult<KeyMetadata> {
    keychain::save_secret(&provider_id, &label, &secret)
}

pub fn backend_delete_secret(key_ref: String) -> BackendResult<()> {
    keychain::delete_secret(&key_ref)
}

pub fn backend_test_secret(key_ref: String) -> BackendResult<bool> {
    keychain::test_secret(&key_ref)
}

pub async fn backend_chat_once(request: ChatRequest) -> BackendResult<ChatResponse> {
    transport::chat_once(request).await
}

pub async fn backend_inspect_local_engines() -> BackendResult<LocalEngineStatus> {
    Ok(local_engine::inspect_local_engines().await)
}

pub async fn backend_search_skills(
    request: SkillCatalogSearchRequest,
) -> BackendResult<SkillCatalogSearchResponse> {
    skill_catalog::search_skills(request).await
}

pub async fn backend_fetch_skill_content(
    request: SkillContentRequest,
) -> BackendResult<SkillContentResponse> {
    skill_catalog::fetch_skill_content(request).await
}

pub fn backend_scan_workspace(
    request: WorkspaceScanRequest,
) -> BackendResult<WorkspaceScanResponse> {
    workspace::scan_workspace(request)
}

pub fn backend_read_workspace_file(
    request: WorkspaceReadRequest,
) -> BackendResult<WorkspaceReadResponse> {
    workspace::read_workspace_file(request)
}
