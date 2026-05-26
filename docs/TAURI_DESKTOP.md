# Tauri Desktop — LyaCodex II

## Objetivo

`src-tauri/` transforma o LyaCodex II em app desktop Tauri isolado.

Ele registra os comandos do backend Rust criado em `backend/`.

## Comandos registrados

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

## Validação

```text
cd src-tauri
cargo check
```

## Execução planejada

```text
npm run tauri dev
```

## Regra de segurança

O frontend deve usar `createLyaCodexBackendClient()` quando estiver dentro do Tauri.

Esse cliente chama o backend Rust e mantém API keys reais fora do frontend.

## Detecção automática

O frontend agora usa:

```text
isTauriRuntime()
runtimeGatewayMode()
```

Quando está no desktop Tauri:

```text
createLyaCodexBackendClient()
```

Quando está no navegador:

```text
createBrowserProviderGateway()
```

## Keychain UI

`ProviderSettingsPanel` aceita `onSaveSecret`.

No Tauri, esse handler usa:

```text
lyacodex_save_secret
```

No navegador, o campo de secret fica desabilitado e o app só salva metadata de `keyRef`.
