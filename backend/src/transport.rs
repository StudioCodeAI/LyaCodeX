use reqwest::Client;
use serde_json::json;
use std::time::Duration;

use crate::contracts::{ChatRequest, ChatResponse};
use crate::error::{BackendError, BackendResult};
use crate::keychain::resolve_secret;
use crate::security::{request_uses_cloud, validate_chat_request};

const TIMEOUT_SECS: u64 = 60;

fn chat_completions_url(base_url: &str) -> String {
    format!("{}/chat/completions", base_url.trim_end_matches('/'))
}

fn http_client() -> BackendResult<Client> {
    Client::builder()
        .timeout(Duration::from_secs(TIMEOUT_SECS))
        .build()
        .map_err(|err| BackendError::Transport(err.to_string()))
}

pub async fn chat_once(request: ChatRequest) -> BackendResult<ChatResponse> {
    validate_chat_request(&request)?;

    let client = http_client()?;
    let payload = json!({
        "model": request.model_id,
        "messages": request.messages,
        "stream": false
    });

    let mut builder = client
        .post(chat_completions_url(&request.base_url))
        .header("Content-Type", "application/json")
        .json(&payload);

    if let Some(key_ref) = request.key_ref.as_deref() {
        let secret = resolve_secret(key_ref)?;
        if !secret.trim().is_empty() && secret != "local" {
            builder = builder.header("Authorization", format!("Bearer {secret}"));
        }
    }

    if request.provider_id == "openrouter" {
        builder = builder
            .header("HTTP-Referer", "https://github.com/LuisCard/LyaCode")
            .header("X-Title", "LyaCodex II");
    }

    let response = builder
        .send()
        .await
        .map_err(|err| BackendError::Transport(err.to_string()))?;

    if !response.status().is_success() {
        return Err(BackendError::Transport(format!(
            "provider returned HTTP {}",
            response.status()
        )));
    }

    let value: serde_json::Value = response
        .json()
        .await
        .map_err(|err| BackendError::InvalidProviderResponse(err.to_string()))?;

    let content = value
        .get("choices")
        .and_then(|choices| choices.get(0))
        .and_then(|choice| choice.get("message"))
        .and_then(|message| message.get("content"))
        .and_then(|content| content.as_str())
        .unwrap_or("")
        .to_string();

    if content.trim().is_empty() {
        return Err(BackendError::InvalidProviderResponse(
            "missing choices[0].message.content".into(),
        ));
    }

    let used_cloud = request_uses_cloud(&request)?;

    Ok(ChatResponse {
        provider_id: request.provider_id,
        model_id: request.model_id,
        content,
        used_cloud,
    })
}

#[cfg(test)]
mod tests {
    use super::chat_completions_url;

    #[test]
    fn builds_chat_completions_url() {
        assert_eq!(
            chat_completions_url("http://localhost:11434/v1/"),
            "http://localhost:11434/v1/chat/completions"
        );
    }
}

