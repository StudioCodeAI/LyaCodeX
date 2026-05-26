use thiserror::Error;

pub type BackendResult<T> = Result<T, BackendError>;

#[derive(Debug, Error)]
pub enum BackendError {
    #[error("unknown provider: {0}")]
    UnknownProvider(String),

    #[error("provider requires keyRef")]
    MissingKeyRef,

    #[error("privacy mode local_only blocks cloud provider")]
    CloudBlockedByPrivacy,

    #[error("keychain error: {0}")]
    Keychain(String),

    #[error("transport error: {0}")]
    Transport(String),

    #[error("invalid provider response: {0}")]
    InvalidProviderResponse(String),

    #[error("workspace error: {0}")]
    Workspace(String),

    #[error("invalid request: {0}")]
    InvalidRequest(String),

    #[error("network request failed: {0}")]
    Network(String),
}
