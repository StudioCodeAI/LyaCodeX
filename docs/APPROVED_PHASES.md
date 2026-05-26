# Approved Phases — LyaCodeX

> Nome oficial: LyaCodeX
> Pasta: E:\GitHub\LyaCodeX

## Fase 0 — Constituição ✅
Arquitetura, regras de IA, segurança, roadmap, skill spec.

## Fase 1 — Núcleo seguro ✅
Contratos compartilhados, keyRef, provider descriptors, model descriptors, security policy, runtime orchestrator, audit event. Keychain via Windows Credential Manager (crate keyring). keyRef nunca exposto no frontend.

## Fase 2 — Settings e Providers ✅ (parcial)
ProviderSettingsPanel, geração de keyRef, teste de provider, seletor de modelos, privacyMode. **Pendente:** teste real de provider via Tauri, shell manager.

## Fase 3 — Workspace Engine ✅ (parcial)
scan_workspace, read_workspace_file, proteção anti path traversal, arquivos sensíveis bloqueados, diretórios ignorados. **Pendente:** WorkspacePanel UI, git status, git diff, patch viewer.

## Fase 4 — Agent Runtime ⏳
ApprovalRequest, classificação Safe/Ask/Danger, planner, command runner, verifier, rollback, logs reais.

## Fase 5 — Skills Engine ✅ (parcial)
SkillCatalogPanel com seletor PT-BR/EN, 11 categorias automáticas, busca local, até 5 skills ativas simultâneas, risco badge, skill_catalog.rs no backend, integração com sickn33/antigravity-awesome-skills. **Pendente:** injeção das skills ativas no system prompt do RuntimeChatPanel.

## Fase 6 — Memory Engine ⏳
SQLite local, resumo de sessão, memória do projeto, histórico de comandos, preferências.

## Fase 7 — Produto final ⏳
README final, screenshots, instalador, auto-update, documentação pública.

## Fase 8 — First Run, Local Engine e Temas ✅ (parcial)
FirstRunWakePanel, LocalEnginePanel com detecção real de Ollama/LM Studio no browser, ThemeTokens documentados (Deep Dark, Glass Dev, Classic Terminal), hardware detection via browser APIs (cores, RAM, GPU WebGL). **Pendente:** theme switcher na UI, animação de sopro.

## Fase 9 — RuntimeChatPanel ✅
RuntimeChatPanel.tsx, splash screen, streaming collect, histórico de mensagens, estados streaming/done/error, wake ritual, privacy guard, keyRef guard.

## Fase 10 — Shell Native Presence ✅ (parcial)
CLI via Clap com 10 subcomandos (wake, status, models, engines, keychain, skills, chat, aliases, info, --version). Aliases: lyacodex, lcx, lya (+ variações case-insensitive via batch wrappers). **Pendente:** registro automático no PATH via NSIS/MSI, integração com PowerShell profile.

## Fase 11 — Hybrid Intelligence Mode ✅ (parcial)
HybridModePanel com 4 modos (local/cloud/hybrid/auto), 4 modos de privacidade, hardware detectado exibido, fluxo visual do Hybrid, regras explicadas do Auto. **Pendente:** escalada automática sugerida pela Lya com aprovação inline no chat.

## Fase 12 — Hardware Detection ⏳
Detecção de RAM via crate sysinfo, GPU/VRAM, perfis de recomendação, sugestão de motor local compatível. Detectado parcialmente no browser (deviceMemory + WebGL).

## Fase 13 — Tool Providers e Web Research ⏳
Tavily Search, Brave Search, Web Fetch, GitHub integration, sistema de permissões por ferramenta.
