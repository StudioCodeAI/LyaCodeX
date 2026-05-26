# LyaCodex II Frontend Modules

Esta pasta guarda os novos módulos de frontend do LyaCodex II sem substituir o app principal.

## RuntimeChatPanel

Arquivos criados:

- `src/components/RuntimeChatPanel.tsx`
- `src/components/RuntimeChatPanel.css`
- `src/components/ProviderSettingsPanel.tsx`
- `src/components/ProviderSettingsPanel.css`
- `src/components/HybridModePanel.tsx`
- `src/components/HybridModePanel.css`
- `src/runtime/types.ts`
- `src/runtime/runtimeClient.ts`

O painel conversa com o runtime por uma interface `RuntimeChatClient`. A implementação Tauri usa:

- `lyacodex_runtime_status`
- `lyacodex_wake_ritual`
- `lyacodex_chat_stream_collect`

Regras preservadas:

- não armazena API key real;
- usa `keyRef` para providers cloud;
- respeita `local_only`;
- separa UI, tipos e cliente de runtime;
- não altera o app principal.
