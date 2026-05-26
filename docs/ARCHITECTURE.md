# Architecture — LyaCodeX

> Arquitetura oficial do LyaCodeX — agente de terminal com IA para programadores.
> Se você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.

## 1. Propósito

O LyaCodeX é um agente de terminal instalável via `lyacodex`, `lcx` ou `lya` em qualquer terminal (VS Code, PowerShell, Windows Terminal). Ajuda programadores a escrever, revisar, depurar e entender código com suporte a modelos locais e cloud.

## 2. Princípio central

> A IA pensa e propõe. O LyaCodeX controla, executa, audita e protege.

## 3. Camadas

```text
LyaCodeX UI (React 19 + TypeScript)
  ↓
Tauri Commands Boundary (IPC seguro)
  ↓
LyaCodeX Backend (Rust — lyacodex_backend)
  ├── Keychain          (Windows Credential Manager)
  ├── Model Gateway     (Ollama, LM Studio, OpenRouter, OpenAI, Gemini, Anthropic, Groq)
  ├── Workspace Engine  (scan, read, patch — com proteção anti traversal)
  ├── Skill Engine      (sickn33/antigravity-awesome-skills, 1200+ skills)
  ├── Agent Runtime     (plan → approve → execute → verify)
  ├── Memory Engine     (SQLite — pendente)
  ├── Security Policy   (Safe / Ask / Danger)
  └── Event Log         (auditável, sem vazar secrets)
```

## 4. Stack técnica

| Camada | Tecnologia |
|--------|-----------|
| Core | Rust + Tauri 2 |
| Frontend | React 19 + TypeScript + Vite |
| Terminal | xterm.js + portable-pty |
| Keychain | crate `keyring` (Windows Credential Manager) |
| Skills | GitHub raw + SKILL.md frontmatter YAML |
| CLI | Clap 4 com subcomandos |
| Aliases | `lyacodex`, `lcx`, `lya` |

## 5. Regras de ouro

1. API key real nunca fica no frontend — apenas `keyRef` (ex: `secret://provider/openai/default`)
2. IA nunca executa comando destrutivo sem aprovação explícita do usuário
3. Skills são módulos com manifesto — não prompts soltos
4. O terminal permanece confiável acima de qualquer feature de IA
5. Toda ação do agente é auditável
6. O usuário sempre pode cancelar, editar ou negar uma ação

## 6. Fluxo de agente

```text
User Request
  ↓
Intent Detection
  ↓
Workspace Context + Skills ativas (até 5)
  ↓
Model Routing (local → cloud conforme modo)
  ↓
Plan Generation
  ↓
User Approval (Safe / Ask / Danger)
  ↓
Execution
  ↓
Verification + Memory Update
```

## 7. Modos de runtime

| Modo | Comportamento |
|------|--------------|
| `local` | Sempre usa motor local (Ollama / LM Studio) |
| `cloud` | Sempre usa provider cloud com API key |
| `hybrid` | Começa local, avisa e pede aprovação para escalar |
| `auto` | Decide por complexidade, contexto, hardware e privacidade |
