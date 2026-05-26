# LyaCodex II Engine

Este diretorio guarda a implementacao inicial do motor LyaCodex II como modulos pequenos e testaveis.

O app principal em `src` e `src-tauri` continua sendo referencia de arquitetura. Este diretorio e a nova base organizada.

## Modulos

- `keychain`: contratos de `keyRef`, sem segredos reais no frontend.
- `model-gateway`: providers, modelos e roteamento local/cloud/hybrid.
- `runtime`: orquestracao de chat e auditoria.
- `security`: classificacao de risco e guardrails.
- `workspace`: politicas para leitura, escrita e exclusoes.
- `agent`: pedido de aprovacao e fluxo de acao.
- `skills`: manifesto oficial e validacao minima.
- `memory`: eventos de memoria persistivel.

