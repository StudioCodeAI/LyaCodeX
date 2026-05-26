# RuntimeChatPanel

## Objetivo

O `RuntimeChatPanel` é o primeiro painel novo do LyaCodex II para conversa com o runtime.

Ele foi criado dentro de `LyaCodex-II/frontend` para não substituir nada no app principal. A pasta principal do LyaCode continua servindo como referência de arquitetura e integração futura.

## Contrato

O painel recebe um `RuntimeChatClient` com três operações:

```text
getStatus()
getWakeRitual()
streamCollect(request)
```

O request usa `keyRef`, não API key real.

## Segurança

O painel bloqueia provider cloud quando o modo de privacidade é `local_only`.

Quando o provider exige chave e não existe `keyRef`, ele não envia a requisição e orienta o usuário a configurar provider.

## Próxima integração

Quando o LyaCodex II virar módulo ativo do app, a integração recomendada é:

1. importar `RuntimeChatPanel`;
2. criar um `client` com `createTauriRuntimeClient()`;
3. passar `providerConfig` vindo do Provider Manager;
4. manter `apiKey` fora do frontend;
5. remover gradualmente o chat antigo baseado em fetch direto.

