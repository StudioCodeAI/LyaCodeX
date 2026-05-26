# Workspace Engine — LyaCodex II

## Objetivo

Permitir que o LyaCodex II abra um projeto real, escaneie arquivos e leia conteudo com limites de seguranca.

## Backend Rust

Arquivos:

```text
backend/src/workspace.rs
backend/src/contracts.rs
backend/src/commands.rs
src-tauri/src/lib.rs
```

Comandos Tauri:

```text
lyacodex_scan_workspace
lyacodex_read_workspace_file
```

## Frontend

Arquivos:

```text
frontend/src/components/WorkspacePanel.tsx
frontend/src/components/WorkspacePanel.css
frontend/src/runtime/workspaceClient.ts
```

## Guardrails

O backend:

- bloqueia path traversal;
- exige path dentro do root;
- ignora `.git`, `node_modules`, `target`, `dist`, `build`, `.next`, `.turbo`;
- detecta `.env`, `.pem`, `.key`, `.p12`, `.sqlite`, `.db`, `id_rsa`, `credentials.json`;
- bloqueia leitura direta de arquivo sensivel ate existir fluxo de aprovacao;
- limita leitura padrao a 128 KB.

## Proximo passo

Conectar Workspace Engine ao Agent Runtime:

```text
pedido -> contexto do workspace -> plano -> aprovacao -> patch -> verificacao
```
