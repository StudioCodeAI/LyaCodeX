use crate::contracts::{ProviderDescriptor, ProviderKind};

pub fn list_providers() -> Vec<ProviderDescriptor> {
    vec![
        ProviderDescriptor {
            id: "ollama".into(),
            name: "Ollama (OpenAI GPT Local)".into(),
            kind: ProviderKind::Local,
            default_base_url: Some("http://localhost:11434/v1".into()),
            requires_key_ref: false,
            supports_streaming: true,
            openai_compatible: true,
        },
        ProviderDescriptor {
            id: "lmstudio".into(),
            name: "LM Studio".into(),
            kind: ProviderKind::Local,
            default_base_url: Some("http://localhost:1234/v1".into()),
            requires_key_ref: false,
            supports_streaming: true,
            openai_compatible: true,
        },
        // lyacodex-trial removido: servidor ainda não existe.
        // Adicionar quando trial.lyacodex.ai estiver hospedado.
        ProviderDescriptor {
            id: "openai".into(),
            name: "OpenAI".into(),
            kind: ProviderKind::Cloud,
            default_base_url: Some("https://api.openai.com/v1".into()),
            requires_key_ref: true,
            supports_streaming: true,
            openai_compatible: true,
        },
        ProviderDescriptor {
            id: "openrouter".into(),
            name: "OpenRouter".into(),
            kind: ProviderKind::Cloud,
            default_base_url: Some("https://openrouter.ai/api/v1".into()),
            requires_key_ref: true,
            supports_streaming: true,
            openai_compatible: true,
        },
        ProviderDescriptor {
            id: "gemini".into(),
            name: "Google Gemini".into(),
            kind: ProviderKind::Cloud,
            default_base_url: Some("https://generativelanguage.googleapis.com/v1beta/openai".into()),
            requires_key_ref: true,
            supports_streaming: true,
            openai_compatible: true,
        },
        ProviderDescriptor {
            id: "anthropic".into(),
            name: "Anthropic Claude".into(),
            kind: ProviderKind::Cloud,
            default_base_url: Some("https://api.anthropic.com/v1".into()),
            requires_key_ref: true,
            supports_streaming: true,
            openai_compatible: false,
        },
        ProviderDescriptor {
            id: "groq".into(),
            name: "Groq".into(),
            kind: ProviderKind::Cloud,
            default_base_url: Some("https://api.groq.com/openai/v1".into()),
            requires_key_ref: true,
            supports_streaming: true,
            openai_compatible: true,
        },
        ProviderDescriptor {
            id: "custom-openai".into(),
            name: "Custom OpenAI-Compatible".into(),
            kind: ProviderKind::Custom,
            default_base_url: None,
            requires_key_ref: false,
            supports_streaming: true,
            openai_compatible: true,
        },
    ]
}

pub fn get_provider(provider_id: &str) -> Option<ProviderDescriptor> {
    list_providers()
        .into_iter()
        .find(|provider| provider.id == provider_id)
}
