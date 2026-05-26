# Implementation Map — LyaCodeX

> Nome oficial: LyaCodeX
> Pasta: E:\GitHub\LyaCodeX

## Estrutura do projeto

```text
E:\GitHub\LyaCodeX\
├── package.json              (@lyacodex/lyacodex)
├── PLANO_EM_DISCUSSÃO.md     (fonte de verdade do projeto)
├── README.md
├── shared\
│   ├── contracts.ts          (tipos compartilhados: providers, runtime, skills)
│   └── index.ts
├── engine\src\
│   ├── keychain\keyRef.ts    (geração de keyRef seguro)
│   ├── model-gateway\
│   │   └── providers.ts      (LYA_PROVIDERS — sem lyacodex-trial)
│   └── ...
├── frontend\src\
│   ├── App.tsx
│   ├── components\
│   │   ├── RuntimeChatPanel.tsx      ✅
│   │   ├── ProviderSettingsPanel.tsx ✅
│   │   ├── HybridModePanel.tsx       ✅ (lógica Auto/Hybrid real)
│   │   ├── SkillCatalogPanel.tsx     ✅ (PT-BR/EN, 11 categorias, 5 skills)
│   │   ├── LocalEnginePanel.tsx      ✅
│   │   ├── FirstRunWakePanel.tsx     ✅
│   │   └── WorkspacePanel.tsx        ⏳ (pendente)
│   ├── runtime\
│   │   ├── environment.ts            ✅ (isTauri + hardware detection)
│   │   ├── localEngineClient.ts      ✅ (detecta Ollama/LM Studio no browser)
│   │   ├── browserProviderGateway.ts ✅ (cloud com keyRef, local direto)
│   │   ├── skillCatalogClient.ts     ✅
│   │   ├── keychainClient.ts         ✅
│   │   └── tauriBackendClient.ts     ✅
│   └── state\
│       └── settingsStore.ts          ✅ (activeSkills[], customBaseUrls, migração v1→v2)
├── backend\
│   ├── Cargo.toml                    (lyacodex_backend)
│   └── src\
│       ├── lib.rs                    ✅
│       ├── commands.rs               ✅
│       ├── contracts.rs              ✅
│       ├── keychain.rs               ✅ (Windows Credential Manager)
│       ├── providers.rs              ✅ (sem trial)
│       ├── transport.rs              ✅ (stream: false — streaming pendente)
│       ├── workspace.rs              ✅ (anti traversal)
│       ├── local_engine.rs           ✅
│       ├── skill_catalog.rs          ✅
│       └── security.rs               ✅
├── src-tauri\
│   ├── Cargo.toml                    (lyacodex_desktop, dep: lyacodex_backend)
│   ├── tauri.conf.json               (productName: LyaCodeX)
│   ├── capabilities\default.json     ✅ (IPC permissions corretas)
│   └── src\
│       ├── lib.rs                    ✅ (usa lyacodex_backend, 14 handlers)
│       └── main.rs                   ✅ (Clap CLI, 10 subcomandos, banner ASCII)
└── scripts\
    ├── install-aliases.ps1           ✅ (lyacodex, lcx, lya + batch wrappers)
    └── install-lyacodex-ii.ps1       ✅ (instalador principal)
```

## Pendente prioritário

1. **Skills no prompt** — injetar `activeSkills[].content` no system prompt do RuntimeChatPanel
2. **Streaming real** — `transport.rs` com `stream: true` + `app_handle.emit()` por chunk
3. **Hardware detection Tauri** — crate `sysinfo` no backend Rust
4. **Theme switcher** — ThemeManager.tsx com os 3 temas e persistência
5. **Chat direto CLI** — `lyacodex chat` com resposta real via backend
