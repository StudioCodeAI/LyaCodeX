# Backend Rust — LyaCodex II

## Objetivo

O backend em `backend/` e o primeiro nucleo Rust proprio do LyaCodex II.

Ele foi criado para substituir o Browser Provider Gateway quando o app for empacotado como Tauri.

## O que existe

- contratos serializaveis;
- catalogo de providers;
- geracao, teste, resolucao e exclusao de `keyRef`;
- politica de privacidade;
- transporte OpenAI-compatible;
- funcoes em `commands.rs` prontas para virar comandos Tauri;
- testes de politica de seguranca.

## Comandos

```text
cargo check
cargo test
```

## Comandos Tauri planejados

```text
lyacodex_runtime_status
lyacodex_wake_ritual
lyacodex_list_providers
lyacodex_check_provider
lyacodex_save_secret
lyacodex_delete_secret
lyacodex_test_secret
lyacodex_chat_once
```

O arquivo `backend/src/tauri_commands.rs` ja expõe esses comandos atrás da feature:

```text
tauri-commands
```

Build padrão:

```text
cargo check
```

Build com comandos Tauri:

```text
cargo check --features tauri-commands
```

## Cliente frontend

O frontend possui um cliente pronto para este backend:

```text
frontend/src/runtime/tauriBackendClient.ts
```

Ele usa:

```text
createLyaCodexBackendClient()
```

Esse cliente converte o contrato atual do `RuntimeChatPanel` para o payload Rust:

```text
provider_id
model_id
base_url
runtime_mode
privacy_mode
key_ref
messages
```

## Regra de segredo

Frontend envia:

```text
secret://provider/openai/default
```

Backend resolve a API key real usando keychain do sistema operacional.

API key real nao deve aparecer no frontend, logs, prompts ou localStorage.
