# Agent Runtime — Fase 4

## Objetivo

Trasformar LyaCodeX em um agente capaz de executar ações com segurança, sob controle total do usuário.

**Princípio:** A IA pensa e propõe. O LyaCodex controla, executa, audita e protege.

---

## Arquitetura

### Componentes Principais

#### 1. **Planner**
- Recebe request do usuário
- Decompõe em passos execuáveis
- Classifica risco (safe/caution/danger)
- Marca passos que precisam aprovação

#### 2. **Approval Modal**
- UI bloqueante para cada ação
- Mostra descrição, comando, contexto
- Usuário aprova ou rejeita
- Logs de todas as decisões

#### 3. **Command Runner**
- Executa comandos aprovados
- Captura stdout/stderr
- Valida resultado
- Trata erros com rollback

#### 4. **Verifier**
- Confirma sucesso da ação
- Valida estado pós-execução
- Detecta efeitos colaterais
- Alimenta retry automático

#### 5. **Rollback**
- Desfaz ações problemáticas
- Mantém histórico completo
- Notifica usuário

---

## Flow de Execução

```
User Request
    ↓
[Planner] → Cria ExecutionPlan com passos
    ↓
[Approval] → Para cada passo com risco:
    - Mostra modal
    - Aguarda decisão
    - Aprova ou rejeita
    ↓
[Command Runner] → Executa comando aprovado
    ↓
[Verifier] → Valida resultado
    ↓
[Log & Continue] → Próximo passo
    ↓
Plan Completo ✅
```

---

## Tipos

```typescript
// Risk classification
type ActionRisk = 'safe' | 'caution' | 'danger';

// Status ao longo da vida
type ActionStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'done' | 'error';

// Um passo do plano
interface PlanStep {
  id: string;
  description: string;
  command?: string;
  args?: Record<string, unknown>;
  risk: ActionRisk;
  requiresApproval: boolean;
  estimatedTime: number;
}

// Plano completo
interface ExecutionPlan {
  id: string;
  userRequest: string;
  steps: PlanStep[];
  totalSteps: number;
  estimatedTime: number;
  riskLevel: ActionRisk;
  createdAt: string;
}

// Request de aprovação bloqueante
interface ApprovalRequest {
  planId: string;
  stepId: string;
  action: string;
  description: string;
  risk: ActionRisk;
  command?: string;
  context?: string;
}

// Resultado de execução
interface ActionResult {
  stepId: string;
  status: ActionStatus;
  output?: string;
  error?: string;
  logs: string[];
  duration: number;
  timestamp: string;
}
```

---

## Risk Classification

### Safe ✅
- Operações read-only
- Criação de arquivos locais
- Consulta de modelos
- Busca de skills

### Caution ⚠️
- Modificações de código (com preview)
- Compilação/build
- Testes com side-effects
- Requisições HTTP

### Danger 🚨
- Exclusão de arquivos/diretórios
- Modificações em diretórios críticos
- Git operations (push/force)
- Comandos do sistema
- Alterações de configuração

---

## Aprovações Automáticas vs. Manuais

### Automáticas (sem modal)
- Passos com `risk: 'safe'`
- Usuário confia na classificação
- Mais rápido, feedback imediato

### Manuais (modal bloqueante)
- Passos com `risk: 'caution'` ou `'danger'`
- Usuário vê descrição + comando
- Pode rejeitar ou solicitar mudanças
- Histórico completo de decisões

---

## Auditoria

Todo agente deixa rastros:

```json
{
  "planId": "plan-1726000000000",
  "userRequest": "Criar arquivo README.md",
  "steps": [
    {
      "stepId": "step-1",
      "description": "Criar arquivo",
      "status": "approved",
      "output": "README.md criado com sucesso",
      "duration": 245,
      "timestamp": "2026-05-26T12:34:56Z"
    }
  ],
  "totalDuration": 245,
  "success": true
}
```

---

## Rollback Strategy

### Level 1: Criar backup
Antes de modificações críticas, salvar estado anterior.

### Level 2: Undo simples
Comandos com undo automático:
- `git checkout` para modificações
- `rm -rf` → backup + delete
- Mudanças de config → restore backup

### Level 3: Transação
Agrupar operações dependentes. Se uma falha, rollback de tudo.

---

## Próximos Passos

1. ✅ Types definidos
2. ✅ UI Components (Modal, Planner)
3. ⏳ Backend plannerRust (decomposição de requests)
4. ⏳ CommandRunner implementação
5. ⏳ Verifier lógica
6. ⏳ Rollback primitivas
7. ⏳ Full integration com RuntimeChatPanel

---

## Referências

- Arquitetura: `docs/ARCHITECTURE.md`
- Segurança: `docs/SECURITY.md`
- Tipos: `shared/types/agent.ts`
- Components: `frontend/src/components/Agent*.tsx`
