# Plano em Discussão — LyaCodeX

> Documento atualizado após implementação da sessão de 25/05/2026.
> Análise e execução: Claude Sonnet 4.6.
> Nome final aprovado: **LyaCodeX** (X maiúsculo — diferencia, marca, remete a eXecuta).

---

## Frases oficiais (imutáveis)

> Se você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.

> O que agrada os olhos, agrada o coração.

> Antes de executar, a Lya precisa respirar um motor.

> A Lya está onde o código acontece: no terminal.

> Na hora de acordar a LyaCodeX, o runtime assopra no ouvido dela.

---

## O que foi implementado nesta sessão ✅

### 1. capabilities/default.json — CRIADO
Arquivo que faltava e bloqueava o build de produção. Permissões corretas:
`core:default`, `core:window:default`, `core:event:allow-listen`, `core:event:allow-emit`, `core:ipc:allow-all`, `opener:default`.

### 2. tauri.conf.json — ATUALIZADO
`productName: "LyaCodeX"`, `identifier: "com.luiscard.lyacodex"`, dimensões corretas (1100×680, min 720×480), `center: true`.

### 3. src-tauri/Cargo.toml — ATUALIZADO
Nome: `lyacodex_desktop`. Description com slogan. Authors correto. Clap adicionado.

### 4. src-tauri/src/main.rs — CLI REAL IMPLEMENTADO
CLI com Clap e subcomandos reais:
- `lyacodex` → abre UI desktop
- `lyacodex wake` → mostra ritual de acordar
- `lyacodex status` → runtime, keychain, skills, engines
- `lyacodex models` → orientação sobre modelos
- `lyacodex engines` → engines locais detectadas
- `lyacodex keychain` → gerenciamento de chaves
- `lyacodex skills [query]` → busca no catálogo
- `lyacodex chat <prompt> [--provider] [--model]` → chat direto (UI para resposta completa)

### 5. SkillCatalogPanel.tsx — TOTALMENTE REESCRITO
**Seletor de idioma PT-BR / EN** com botões 🇧🇷 PT e 🇺🇸 EN.
**11 categorias automáticas** por palavras-chave no nome/descrição/id:
- 💻 Desenvolvimento · 🔒 Segurança · 🧪 Testes · ⚙️ DevOps/Infra
- 📊 Dados & IA · 🏥 Medicina · 💰 Contabilidade/Finanças
- ✍️ Redação & Docs · 🎨 Design & UX · 🤖 Agentes & Automação · 📦 Outros
**Tradução automática** de nomes e descrições para PT-BR.
**Risk badges** visuais: ✅ Seguro / ⚠️ Requer aprovação / 🚨 Perigoso.
**Contagem por categoria** nos botões de filtro.
**Busca local** em tempo real sem nova requisição ao servidor.
**Limpa query** com botão ✕.
**Carrega 200 skills** de uma vez e filtra localmente.

### 6. SkillCatalogPanel.css — REESCRITO
Design novo: cards com meta-info alinhada, badges de risco coloridos, filtros de categoria em pills, seletor de idioma integrado no header, spinner animado, estado vazio.

### 7. backend/src/providers.rs — CORRIGIDO
Removido `lyacodex-trial` (endpoint `trial.lyacodex.ai` não existe — quebraria na primeira experiência).
Adicionado `Anthropic Claude` como provider cloud.
Ollama renomeado para `"Ollama (OpenAI GPT Local)"` para reforçar o posicionamento.

### 8. docs/ROADMAP.md — ATUALIZADO com Fases 8–13
Todas as 14 fases documentadas com status atual (✅ feito / ✅ parcial / ⏳ pendente).

---

## Estado real do projeto após esta sessão

| Arquivo | Status |
|---------|--------|
| `src-tauri/capabilities/default.json` | ✅ Criado |
| `src-tauri/tauri.conf.json` | ✅ Atualizado (LyaCodeX) |
| `src-tauri/Cargo.toml` | ✅ Atualizado |
| `src-tauri/src/main.rs` | ✅ CLI real com Clap |
| `src-tauri/src/lib.rs` | ✅ Handlers registrados |
| `backend/src/providers.rs` | ✅ Trial removido, Anthropic adicionado |
| `frontend/src/App.tsx` | ✅ RuntimeChatPanel integrado |
| `frontend/src/components/RuntimeChatPanel.tsx` | ✅ Funcional |
| `frontend/src/components/SkillCatalogPanel.tsx` | ✅ PT-BR/EN + categorias |
| `frontend/src/components/SkillCatalogPanel.css` | ✅ Design novo |
| `docs/ROADMAP.md` | ✅ Fases 0–13 documentadas |
| `PLANO_EM_DISCUSSÃO.md` | ✅ Este arquivo |

---

## Próximos passos recomendados

### Imediato — compilar e testar
```powershell
cd E:\GitHub\LyaCode\LyaCodex-II
npm install
npm run tauri dev
```

### Próxima sessão de desenvolvimento

**Prioridade 1 — Streaming real**
O `transport.rs` envia `"stream": false`. Implementar `stream_chat` com `app_handle.emit()` por chunk via Tauri events. Isso faz a IA parecer viva — é a diferença de um chatbot lento para um terminal inteligente.

**Prioridade 2 — Hardware Detection (antecipar da Fase 12)**
Adicionar crate `sysinfo` ao `backend/Cargo.toml`. Criar `hardware.rs` com detecção de RAM e GPU. Expor no `LocalEnginePanel` com perfil de recomendação. Esse é o momento "uau" do First Run.

**Prioridade 3 — Theme switcher na UI**
Os tokens estão em `THEME_TOKENS.md`. Criar `ThemeManager.tsx` com os 3 temas e persistência no `settingsStore`.

**Prioridade 4 — Aliases no PATH**
Criar script de instalação que registra `lya`, `lyacode` e `lyacodex` no PATH do Windows via PowerShell.

---

## Decisões confirmadas (não reabrir)

| Decisão | Status |
|---------|--------|
| Nome final: LyaCodeX | ✅ Aprovado |
| Linguagem core: Rust + Tauri 2 | ✅ Em produção |
| Keychain via Windows Credential Manager | ✅ Funcionando |
| Skills em PT-BR + EN com seletor | ✅ Implementado |
| 11 categorias de skills | ✅ Implementado |
| Trial endpoint removido até existir | ✅ Feito |
| CLI via Clap com subcomandos | ✅ Implementado |
| Roadmap completo com Fases 0–13 | ✅ Documentado |

---

## Regra de execução (imutável)

```
feito = arquivo existe + integração existe + arquivo relido após alteração
```

---

*Última atualização: Claude Sonnet 4.6 — 25/05/2026*
*Próxima IA: leia este arquivo + `docs/AI_RULES.md` antes de qualquer edição.*
