# Roadmap — LyaCodeX

> Nome final do produto: **LyaCodeX** (X maiúsculo)
> Slogan: *Se você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.*

## Filosofia

O projeto deve crescer em fases pequenas, testáveis e reversíveis.

Nada de:

- reescrever tudo de uma vez;
- adicionar 1000 features sem base;
- múltiplas IAs alterando arquitetura ao mesmo tempo.

Regra de execução:

```
feito = arquivo existe + integração existe + arquivo relido após alteração
```

---

# Fase 0 — Constituição ✅

Objetivo: impedir bagunça arquitetural.

**Entregas:** ARCHITECTURE.md · AI_RULES.md · SECURITY.md · ROADMAP.md · SKILL_SPEC.md

---

# Fase 1 — Núcleo seguro ✅

Objetivo: preparar a fundação.

**Entregas:** Lya Keychain (keyring OS nativo) · keyRef no frontend · backend Rust · transport com timeout · providers desacoplados · logs seguros

---

# Fase 2 — Settings e Providers ✅ (parcial)

Objetivo: UX profissional.

**Entregas feitas:** ProviderSettingsPanel · geração de keyRef · teste de provider · seletor de modelos · privacyMode

**Pendente:** shell manager · teste de provider via Tauri real

---

# Fase 3 — Workspace Engine ✅ (parcial)

Objetivo: entender projetos reais.

**Entregas feitas:** scan_workspace · read_workspace_file · path traversal protection · arquivos sensíveis bloqueados · diretórios ignorados

**Pendente:** WorkspacePanel UI completo · git status · git diff · patch viewer

---

# Fase 4 — Agent Runtime ⏳

Objetivo: IA capaz de agir com segurança.

**Entregas:** planner · approval modal · command runner · verifier · rollback básico · logs reais

---

# Fase 5 — Skills Engine ✅ (parcial)

Objetivo: sistema modular real.

**Entregas feitas:** SkillCatalogPanel com seletor PT-BR/EN · categorias automáticas (11 categorias) · busca por query + categoria + risco · skill_catalog.rs no backend · integração com sickn33/antigravity-awesome-skills

**Pendente:** ranking por relevância · ativação dinâmica no contexto · skills oficiais LyaCodeX

---

# Fase 6 — Memory Engine ⏳

Objetivo: continuidade.

**Entregas:** SQLite local · resumo de sessão · memória do projeto · decisões técnicas · histórico de comandos · preferências

---

# Fase 7 — Produto final ⏳

Objetivo: experiência profissional.

**Entregas:** README final · screenshots · instalador · auto-update opcional · telemetria opcional · export de logs · documentação pública

---

# Fase 8 — First Run, OpenAI GPT Local e Temas ✅ (parcial)

Objetivo: primeira impressão poderosa.

**Entregas feitas:** FirstRunWakePanel · LocalEnginePanel · ThemeTokens documentados (Deep Dark, Glass Dev, Classic Terminal) · VISUAL_IDENTITY.md

**Pendente:** Theme switcher na UI · animação de "sopro" no wake · highlight ⭐ OpenAI GPT Local

---

# Fase 9 — RuntimeChatPanel ✅

Objetivo: chat visual da Lya.

**Entregas feitas:** RuntimeChatPanel.tsx · integrado no App.tsx · streaming collect · histórico de mensagens · estados streaming/done/error · wake ritual · status do runtime · privacy guard · keyRef guard

---

# Fase 10 — Shell Native Presence ✅ (parcial)

Objetivo: a Lya no terminal.

**Entregas feitas:** CLI `lyacodex` via Clap com subcomandos: wake, status, models, engines, keychain, skills, chat · binário desktop com fallback para UI

**Pendente:** registro no PATH via instalador · aliases `lya` e `lyacode` · integração com PowerShell profile · integração com VS Code terminal

---

# Fase 11 — Hybrid Intelligence Mode ✅ (parcial)

Objetivo: local para rotina, cloud para potência.

**Entregas feitas:** HybridModePanel · runtimeMode (local/cloud/hybrid/auto) · privacyMode (local_only/ask_before_cloud/cloud_allowed/auto) · bloqueio cloud quando local_only

**Pendente:** escalada automática sugerida pela Lya · notificação quando trocar de modo · Auto Mode inteligente

---

# Fase 12 — Hardware Detection ⏳

Objetivo: "o terminal reconheceu meu hardware".

**Entregas:** detecção de RAM via crate `sysinfo` · detecção de GPU/VRAM · perfis de recomendação (leve/recomendado/forte) · sugestão de motor local compatível · exibir no First Run e Local Engine panel

**Prioridade:** antecipar para antes da Fase 7 — é o momento de impressão mais forte.

---

# Fase 13 — Tool Providers e Web Research ⏳

Objetivo: a Lya pesquisa e age no mundo.

**Entregas:** Tavily Search · Brave Search · Web Fetch · GitHub integration · Hugging Face catalog · sistema de permissões por ferramenta (safe/ask/danger) · aprovação antes de ação externa

---

# Backlog futuro

- Streaming real via Tauri events (emit por chunk)
- Chat direto via CLI sem abrir UI
- Memory Engine com SQLite
- Diff Viewer para patches
- Agent Approval Flow completo
- Skills próprias LyaCodeX no catálogo
- trial.lyacodex.ai quando servidor estiver hospedado
- LyaCodeX no npm / winget / cargo
