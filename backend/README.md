# LyaCodex II Backend

Backend Rust isolado do LyaCodex II.

Ele foi criado para virar o nucleo Tauri/Rust real do projeto, sem depender do app principal.

## Modulos

- `contracts`: tipos serializaveis compartilhados com UI;
- `keychain`: geracao e resolucao de `keyRef`;
- `providers`: catalogo de providers;
- `security`: politica local/cloud/keyRef;
- `transport`: chamada OpenAI-compatible;
- `commands`: funcoes prontas para virar comandos Tauri.

## Validacao

```text
cargo check
cargo test
```

## Regra de seguranca

API key real nunca deve circular pelo frontend. A UI envia `key_ref`; o backend resolve o segredo no keychain do sistema.

