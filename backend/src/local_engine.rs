use crate::contracts::{LocalEngineDescriptor, LocalEngineStatus};
use std::time::Duration;

const OLLAMA_BASE_URL: &str = "http://localhost:11434/v1";
const OLLAMA_HEALTH_URL: &str = "http://localhost:11434/api/version";
const OLLAMA_MODELS_URL: &str = "http://localhost:11434/api/tags";
const GPT_OSS_RUNTIME_MODEL: &str = "gpt-oss:20b";

pub async fn inspect_local_engines() -> LocalEngineStatus {
    let ollama_reachable = endpoint_reachable(OLLAMA_HEALTH_URL).await;
    let model_available = if ollama_reachable {
        model_exists(OLLAMA_MODELS_URL, GPT_OSS_RUNTIME_MODEL).await
    } else {
        false
    };

    let message = match (ollama_reachable, model_available) {
        (true, true) => "Ollama is running and gpt-oss:20b is available.",
        (true, false) => "Ollama is running. Pull gpt-oss:20b to enable OpenAI GPT Local.",
        (false, _) => "Ollama was not reachable on localhost:11434.",
    };

    LocalEngineStatus {
        recommended_provider_id: "ollama".into(),
        recommended_model_id: "openai-gpt-local".into(),
        recommended_runtime_model: GPT_OSS_RUNTIME_MODEL.into(),
        engines: vec![LocalEngineDescriptor {
            id: "ollama".into(),
            name: "Ollama".into(),
            provider_id: "ollama".into(),
            base_url: OLLAMA_BASE_URL.into(),
            health_url: OLLAMA_HEALTH_URL.into(),
            models_url: OLLAMA_MODELS_URL.into(),
            install_url: "https://ollama.com/download".into(),
            recommended_model: GPT_OSS_RUNTIME_MODEL.into(),
            install_command: format!("ollama pull {GPT_OSS_RUNTIME_MODEL}"),
            detected: ollama_reachable,
            reachable: ollama_reachable,
            model_available,
            message: message.into(),
        }],
    }
}

async fn endpoint_reachable(url: &str) -> bool {
    let Ok(client) = reqwest::Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
    else {
        return false;
    };

    client
        .get(url)
        .send()
        .await
        .map(|response| response.status().is_success())
        .unwrap_or(false)
}

async fn model_exists(url: &str, model_name: &str) -> bool {
    let Ok(client) = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
    else {
        return false;
    };

    let Ok(response) = client.get(url).send().await else {
        return false;
    };

    if !response.status().is_success() {
        return false;
    }

    let Ok(value) = response.json::<serde_json::Value>().await else {
        return false;
    };

    value
        .get("models")
        .and_then(|models| models.as_array())
        .map(|models| {
            models.iter().any(|model| {
                model
                    .get("name")
                    .and_then(|name| name.as_str())
                    .map(|name| name == model_name || name.starts_with("gpt-oss:20b"))
                    .unwrap_or(false)
            })
        })
        .unwrap_or(false)
}
