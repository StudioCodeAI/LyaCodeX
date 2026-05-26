use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ProviderKind {
    Local,
    Cloud,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RuntimeMode {
    Local,
    Cloud,
    Hybrid,
    Auto,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PrivacyMode {
    LocalOnly,
    AskBeforeCloud,
    CloudAllowed,
    Auto,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderDescriptor {
    pub id: String,
    pub name: String,
    pub kind: ProviderKind,
    pub default_base_url: Option<String>,
    pub requires_key_ref: bool,
    pub supports_streaming: bool,
    pub openai_compatible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyMetadata {
    pub label: String,
    pub key_ref: String,
    pub provider_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub provider_id: String,
    pub model_id: String,
    pub base_url: String,
    pub messages: Vec<ChatMessage>,
    pub stream: bool,
    pub runtime_mode: RuntimeMode,
    pub privacy_mode: PrivacyMode,
    pub key_ref: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub provider_id: String,
    pub model_id: String,
    pub content: String,
    pub used_cloud: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderCheck {
    pub provider_id: String,
    pub status: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeStatus {
    pub status: String,
    pub message: String,
    pub supports_streaming: bool,
    pub supports_cancel: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WakeRitual {
    pub event_type: String,
    pub status: String,
    pub whisper: String,
    pub oath: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceScanRequest {
    pub root_path: String,
    pub max_depth: Option<usize>,
    pub max_entries: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceEntry {
    pub name: String,
    pub relative_path: String,
    pub is_dir: bool,
    pub size: Option<u64>,
    pub ignored: bool,
    pub sensitive: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceScanResponse {
    pub root_path: String,
    pub entries: Vec<WorkspaceEntry>,
    pub truncated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceReadRequest {
    pub root_path: String,
    pub relative_path: String,
    pub max_bytes: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceReadResponse {
    pub relative_path: String,
    pub content: String,
    pub bytes_read: usize,
    pub truncated: bool,
    pub sensitive: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalEngineDescriptor {
    pub id: String,
    pub name: String,
    pub provider_id: String,
    pub base_url: String,
    pub health_url: String,
    pub models_url: String,
    pub install_url: String,
    pub recommended_model: String,
    pub install_command: String,
    pub detected: bool,
    pub reachable: bool,
    pub model_available: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalEngineStatus {
    pub recommended_provider_id: String,
    pub recommended_model_id: String,
    pub recommended_runtime_model: String,
    pub engines: Vec<LocalEngineDescriptor>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillCatalogEntry {
    pub id: String,
    pub name: String,
    pub path: String,
    pub category: Option<String>,
    pub description: String,
    pub risk: Option<String>,
    pub source: Option<String>,
    pub date_added: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillCatalogSearchRequest {
    pub query: Option<String>,
    pub category: Option<String>,
    pub risk: Option<String>,
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillCatalogSearchResponse {
    pub source_url: String,
    pub attribution: String,
    pub entries: Vec<SkillCatalogEntry>,
    pub total_loaded: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillContentRequest {
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillContentResponse {
    pub path: String,
    pub source_url: String,
    pub content: String,
}
