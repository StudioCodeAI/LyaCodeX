# Running LyaCodex II Locally

## Comandos

```text
npm run dev
npm run build
npm run typecheck
```

## Porta padrao

```text
http://127.0.0.1:5174
```

## Estado atual

O app executavel carrega:

- Runtime Chat Panel;
- Provider Settings Panel;
- Hybrid Mode Panel;
- Browser Provider Gateway para providers locais OpenAI-compatible;
- bloqueio de cloud ate existir runtime Tauri/Rust com Keychain real.

## Proxima conexao real

O Browser Provider Gateway deve ser substituido por:

```text
createTauriRuntimeClient()
```

Quando o backend Tauri/Rust do LyaCodex II estiver ativo no mesmo pacote.

## Seguranca atual

O app salva apenas preferencias e `keyRef` no navegador.

Ele nao salva API key real no frontend.
