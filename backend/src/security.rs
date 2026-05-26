use crate::contracts::{ChatRequest, PrivacyMode, ProviderKind};
use crate::error::{BackendError, BackendResult};
use crate::providers::get_provider;

pub fn validate_chat_request(request: &ChatRequest) -> BackendResult<bool> {
    let provider = get_provider(&request.provider_id)
        .ok_or_else(|| BackendError::UnknownProvider(request.provider_id.clone()))?;

    if provider.kind == ProviderKind::Cloud && request.privacy_mode == PrivacyMode::LocalOnly {
        return Err(BackendError::CloudBlockedByPrivacy);
    }

    if provider.requires_key_ref && request.key_ref.as_deref().unwrap_or("").trim().is_empty() {
        return Err(BackendError::MissingKeyRef);
    }

    Ok(true)
}

pub fn request_uses_cloud(request: &ChatRequest) -> BackendResult<bool> {
    let provider = get_provider(&request.provider_id)
        .ok_or_else(|| BackendError::UnknownProvider(request.provider_id.clone()))?;

    Ok(provider.kind == ProviderKind::Cloud)
}

