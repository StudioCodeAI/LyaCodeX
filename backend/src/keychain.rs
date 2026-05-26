use keyring::Entry;

use crate::contracts::KeyMetadata;
use crate::error::{BackendError, BackendResult};

const SERVICE_NAME: &str = "LyaCodexII";

pub fn build_key_ref(provider_id: &str, label: &str) -> String {
    let provider = provider_id.trim().to_lowercase();
    let label = label.trim().to_lowercase().replace(' ', "-");
    format!("secret://provider/{provider}/{label}")
}

pub fn save_secret(provider_id: &str, label: &str, secret: &str) -> BackendResult<KeyMetadata> {
    let key_ref = build_key_ref(provider_id, label);
    let entry = Entry::new(SERVICE_NAME, &key_ref)
        .map_err(|err| BackendError::Keychain(err.to_string()))?;

    entry
        .set_password(secret)
        .map_err(|err| BackendError::Keychain(err.to_string()))?;

    Ok(KeyMetadata {
        label: label.into(),
        key_ref,
        provider_id: provider_id.into(),
    })
}

pub fn resolve_secret(key_ref: &str) -> BackendResult<String> {
    let entry = Entry::new(SERVICE_NAME, key_ref)
        .map_err(|err| BackendError::Keychain(err.to_string()))?;

    entry
        .get_password()
        .map_err(|err| BackendError::Keychain(err.to_string()))
}

pub fn delete_secret(key_ref: &str) -> BackendResult<()> {
    let entry = Entry::new(SERVICE_NAME, key_ref)
        .map_err(|err| BackendError::Keychain(err.to_string()))?;

    entry
        .delete_credential()
        .map_err(|err| BackendError::Keychain(err.to_string()))
}

pub fn test_secret(key_ref: &str) -> BackendResult<bool> {
    match resolve_secret(key_ref) {
        Ok(secret) => Ok(!secret.trim().is_empty()),
        Err(_) => Ok(false),
    }
}

#[cfg(test)]
mod tests {
    use super::build_key_ref;

    #[test]
    fn builds_stable_key_ref() {
        assert_eq!(
            build_key_ref("OpenAI", "Default Key"),
            "secret://provider/openai/default-key"
        );
    }
}

