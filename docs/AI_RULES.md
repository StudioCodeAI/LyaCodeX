# AI Rules — LyaCodeX

Estas regras existem para impedir retrabalho, conflito de arquitetura e mudanças inseguras.
**Leia este arquivo antes de qualquer edição no projeto.**

## 1. Nenhuma IA reescreve arquitetura sem atualizar documentação

Antes de alterar arquitetura:
- atualizar `ARCHITECTURE.md`
- explicar motivo, impacto e rollback

## 2. Segurança vem antes de feature nova

Não implementar execução automática, memória longa, automação agressiva ou envio automático de arquivos antes de keychain, políticas de aprovação, logs e regras de segurança estarem prontos.

## 3. Frontend não guarda segredo real

Nunca salvar API keys, tokens, secrets ou credenciais em localStorage, Zustand persist, logs, prompt ou analytics.

O frontend guarda apenas referências:
```
secret://provider/openrouter/default
```

## 4. Não misturar responsabilidades

Não colocar UI, provider, workspace, skills, segurança e execução de agente no mesmo arquivo.

## 5. Toda ação do agente deve ser auditável

Toda ação relevante deve informar: motivo, comando, arquivos afetados, risco e resultado.

## 6. Não interceptar teclas essenciais do terminal

O terminal é prioridade. Não quebrar `/`, pipes, atalhos comuns, input shell ou comportamento PTY.

## 7. Mudanças devem ser pequenas

Evitar mega commits, reescritas totais, alterações sem teste e mudanças sem rollback.

## 8. Skills precisam de manifesto

Toda skill deve ter: `SKILL.md` com frontmatter YAML contendo descrição, permissões, categoria, triggers e exemplos.

## 9. O usuário sempre tem controle

O usuário deve poder aprovar, negar, editar, cancelar e desfazer qualquer ação.

## 10. O projeto deve continuar leve

Evitar dependências gigantes sem necessidade, frameworks pesados, excesso de abstração e processos em segundo plano desnecessários.

---

## Nomenclatura oficial (imutável)

| Elemento | Valor correto |
|----------|--------------|
| Nome do produto | **LyaCodeX** |
| Nome no terminal | `lyacodex` |
| Aliases | `lcx`, `lya` (+ variações case-insensitive) |
| Pasta do projeto | `E:\GitHub\LyaCodeX` |
| Crate backend | `lyacodex_backend` |
| Crate desktop | `lyacodex_desktop` |
| Lib desktop | `lyacodex_desktop_lib` |
| Package npm | `@lyacodex/lyacodex` |
| Identifier Tauri | `com.luiscard.lyacodex` |

**Referências proibidas (não usar mais):**
- `LyaCodex-II` ❌
- `LyaCodex II` ❌
- `lyacodex-ii` ❌
- `lyacodex_ii_backend` ❌
- `@lyacode/lyacodex-ii` ❌
- `lyacodex-trial` ❌ (endpoint não existe)
