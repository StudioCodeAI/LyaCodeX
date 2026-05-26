/**
 * State management para Agent Runtime
 * Gerencia planos, aprovações e execuções
 */

import { AgentRuntimeState, ExecutionPlan, ApprovalRequest, ActionResult } from '../../../shared/types/agent';

const STORAGE_KEY = 'lyacodex-agent-state';

export function loadAgentState(): AgentRuntimeState {
  if (typeof window === 'undefined') return getDefaultAgentState();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultAgentState();
  } catch {
    return getDefaultAgentState();
  }
}

export function saveAgentState(state: AgentRuntimeState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getDefaultAgentState(): AgentRuntimeState {
  return {
    executedSteps: [],
    isExecuting: false,
  };
}

export function createExecutionPlan(
  userRequest: string,
  steps: ExecutionPlan['steps'],
  riskLevel: ExecutionPlan['riskLevel'],
): ExecutionPlan {
  const totalTime = steps.reduce((sum, s) => sum + s.estimatedTime, 0);
  return {
    id: `plan-${Date.now()}`,
    userRequest,
    steps,
    totalSteps: steps.length,
    estimatedTime: totalTime,
    riskLevel,
    createdAt: new Date().toISOString(),
  };
}

export function addExecutedStep(state: AgentRuntimeState, result: ActionResult): AgentRuntimeState {
  return {
    ...state,
    executedSteps: [...state.executedSteps, result],
  };
}

export function setPendingApproval(
  state: AgentRuntimeState,
  approval: ApprovalRequest | undefined,
): AgentRuntimeState {
  return {
    ...state,
    pendingApproval: approval,
  };
}
