# Implementation Map — LyaCodex II

## Regra de escopo

Tudo nesta etapa foi criado dentro de `LyaCodex-II`.

O app principal em `src` e `src-tauri` continua como referencia e nao foi substituido por esta estrutura.

## Estrutura criada

```text
LyaCodex-II
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── shared
│   ├── contracts.ts
│   └── index.ts
├── engine
│   ├── README.md
│   └── src
│       ├── agent
│       ├── keychain
│       ├── memory
│       ├── model-gateway
│       ├── runtime
│       ├── security
│       ├── skills
│       └── workspace
├── frontend
│   └── src
│       ├── components
│       └── runtime
├── backend
│   ├── Cargo.toml
│   └── src
│       ├── commands.rs
│       ├── contracts.rs
│       ├── keychain.rs
│       ├── providers.rs
│       ├── security.rs
│       ├── transport.rs
│       └── workspace.rs
├── src-tauri
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src
│       ├── lib.rs
│       └── main.rs
└── examples
    ├── prompts
    └── skills
```

## Nucleo implementado

### Shared contracts

Define os contratos entre UI, runtime e engine:

- providers;
- modelos;
- runtime request;
- action intent;
- approval request;
- audit event.

### Engine

Implementa a primeira versao de:

- keyRef;
- provider registry;
- model registry;
- politica de privacidade;
- classificacao de risco;
- orquestrador de runtime;
- auditoria;
- politica de workspace;
- manifesto de skills;
- eventos de memoria.

### Frontend

Implementa paineis iniciais:

- `RuntimeChatPanel`;
- `ProviderSettingsPanel`;
- `HybridModePanel`.
- `BrowserProviderGateway` para testar providers locais OpenAI-compatible.

## Persistencia atual

O app persiste somente:

- provider selecionado;
- modelo selecionado;
- runtime mode;
- privacy mode;
- `keyRef` metadata.

Nao persiste API key real no frontend.

## Proximo bloco recomendado

1. Conectar Workspace Engine ao Agent Runtime.
2. Criar Patch Viewer.
3. Criar command runner com aprovacao.
