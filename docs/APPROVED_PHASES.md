# Approved Phases — LyaCodex II

## Fase 0 — Constituicao

Status: documentada.

Entregas:

- arquitetura;
- regras de IA;
- seguranca;
- roadmap;
- skill spec.

## Fase 1 — Nucleo seguro

Status: em implementacao.

Entregas iniciais criadas:

- contratos compartilhados;
- `keyRef`;
- provider descriptors;
- model descriptors;
- security policy;
- runtime orchestrator;
- audit event.

## Fase 2 — Settings e Providers

Status: em implementacao inicial.

Entregas iniciais criadas:

- `ProviderSettingsPanel`;
- geracao de `keyRef`;
- teste de provider por callback;
- capacidades de provider expostas na UI.

## Fase 3 — Workspace Engine

Status: base de politica criada.

Entregas iniciais:

- ignorar `.git`, `node_modules`, `target`, `dist`, `build`;
- detectar arquivos sensiveis;
- bloquear envio automatico de arquivos sensiveis para cloud.

## Fase 4 — Agent Runtime

Status: contrato inicial criado.

Entregas:

- `ApprovalRequest`;
- classificacao safe, ask, danger;
- helper para saber quando pedir aprovacao.

## Fase 5 — Skills Engine

Status: manifestos e validacao minima criados.

Entregas:

- `SkillManifest`;
- `validateSkillManifest`;
- exemplo oficial `git.commit-assistant`.

## Fase 6 — Memory Engine

Status: contrato inicial criado.

Entregas:

- `MemoryEvent`;
- categorias iniciais de memoria.

## Fase 7 — Produto final

Status: pendente.

Depende das fases 1 a 6 funcionando com UI e backend real.

## Fase 8 — First Run, OpenAI GPT Local e Temas

Status: documentada no projeto e parcialmente representada pelos contratos.

## Fase 9 — RuntimeChatPanel

Status: criado em `frontend/src/components/RuntimeChatPanel.tsx`.

## Fase 10 — Shell Native Presence

Status: documentada, implementacao pendente.

## Fase 11 — Hybrid Intelligence Mode

Status: painel inicial criado em `HybridModePanel`.

## Fase 12 — Hardware Detection

Status: pendente.

## Fase 13 — Tool Providers e Web Research

Status: documentada, implementacao pendente.

