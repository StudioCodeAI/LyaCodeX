/**
 * Types para Agent Runtime
 * A IA pensa e propõe. O LyaCodeX controla, executa, audita e protege.
 */

export type ActionRisk = 'safe' | 'caution' | 'danger';
export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'done' | 'error';

export interface PlanStep {
  id: string;
  description: string;
  command?: string;
  args?: Record<string, unknown>;
  risk: ActionRisk;
  requiresApproval: boolean;
  estimatedTime: number; // ms
}

export interface ExecutionPlan {
  id: string;
  userRequest: string;
  steps: PlanStep[];
  totalSteps: number;
  estimatedTime: number; // ms
  riskLevel: ActionRisk;
  createdAt: string;
}

export interface ApprovalRequest {
  planId: string;
  stepId: string;
  action: string;
  description: string;
  risk: ActionRisk;
  command?: string;
  context?: string;
}

export interface ActionResult {
  stepId: string;
  status: ActionStatus;
  output?: string;
  error?: string;
  logs: string[];
  duration: number; // ms
  timestamp: string;
}

export interface AgentRuntimeState {
  currentPlan?: ExecutionPlan;
  pendingApproval?: ApprovalRequest;
  executedSteps: ActionResult[];
  isExecuting: boolean;
  lastError?: string;
}
