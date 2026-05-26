use lyacodex_ii_backend::contracts::{ChatRequest, PrivacyMode, RuntimeMode};
use lyacodex_ii_backend::security::validate_chat_request;

fn request(provider_id: &str, privacy_mode: PrivacyMode, key_ref: Option<String>) -> ChatRequest {
    ChatRequest {
        provider_id: provider_id.into(),
        model_id: "test-model".into(),
        base_url: "http://localhost:11434/v1".into(),
        messages: vec![],
        stream: false,
        runtime_mode: RuntimeMode::Hybrid,
        privacy_mode,
        key_ref,
    }
}

#[test]
fn local_provider_is_allowed_without_key_ref() {
    let result = validate_chat_request(&request("ollama", PrivacyMode::LocalOnly, None));
    assert!(result.is_ok());
}

#[test]
fn cloud_provider_is_blocked_by_local_only() {
    let result = validate_chat_request(&request(
        "openai",
        PrivacyMode::LocalOnly,
        Some("secret://provider/openai/default".into()),
    ));
    assert!(result.is_err());
}

#[test]
fn cloud_provider_requires_key_ref() {
    let result = validate_chat_request(&request("openai", PrivacyMode::AskBeforeCloud, None));
    assert!(result.is_err());
}

