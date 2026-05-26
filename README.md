# LyaCodeX

> **LyaCodeX** e o agente de terminal com IA para programadores.
> Se voce pensa, voce executa. Se voce executa, voce indexa. Se voce indexa, voce evolui.

---

## Missao

Transformar o LyaCodeX em um terminal de engenharia com IA que seja:

- **liso**: rapido, estavel, sem travar input ou quebrar fluxo de terminal
- **seguro**: chaves protegidas, acoes perigosas com aprovacao, logs sem segredos
- **local-first**: capaz de usar Ollama, LM Studio e outros motores locais
- **multi-modelo**: compativel com OpenRouter, OpenAI, Gemini, Anthropic, Groq
- **orientado por skills**: skills com manifesto, permissoes, prompts e ativacao por relevancia
- **util para codigo real**: abrir projetos, ler arquivos, revisar diffs, rodar testes e propor patches
- **controlado pelo usuario**: a IA propoe, o LyaCodeX executa somente com permissao

---

## Principio central

> A IA pensa e propoe. O LyaCodeX controla, executa, audita e protege.

---

## Stack tecnica

| Camada | Tecnologia |
|--------|-----------|
| Core | Rust + Tauri 2 |
| Frontend | React 19 + TypeScript + Vite |
| Terminal | xterm.js + portable-pty |
| Keychain | Windows Credential Manager (crate keyring) |
| Skills | sickn33/antigravity-awesome-skills (1200+ skills) |
| CLI | Clap 4 |
| Aliases | lyacodex, lcx, lya |

---

## Estrutura do projeto

```
LyaCodeX/
├── shared/         contratos entre UI, engine e runtime
├── engine/         keyRef, providers, security, runtime, agent, skills
├── frontend/       paineis React: Chat, Skills, Providers, Hybrid, Local
├── backend/        Rust: keychain, transport, workspace, skill_catalog
├── src-tauri/      Tauri desktop: lib.rs, main.rs (CLI Clap)
├── scripts/        install-aliases.ps1, git-sync.ps1
└── docs/           ARCHITECTURE, AI_RULES, ROADMAP, APPROVED_PHASES
```

---

## Aliases no terminal

```
lyacodex          abre a interface desktop
lcx               atalho curto
lya               atalho mais curto
lyacodex wake     ritual de inicio
lyacodex status   status do runtime
lyacodex skills   catalogo de skills
lyacodex aliases  lista todos os aliases
```

---

## Instalacao

```powershell
cd E:\GitHub\LyaCodeX
npm install
npm run tauri dev

# Para instalar aliases no terminal:
.\scripts\install-aliases.ps1
```

---

## Slogan

Se voce pensa, voce executa.
Se voce executa, voce indexa.
Se voce indexa, voce evolui.
