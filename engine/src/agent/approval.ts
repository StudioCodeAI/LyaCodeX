import { ActionIntent, ApprovalRequest } from '../../../shared';
import { classifyActionRisk } from '../security/policy';

export function createApprovalRequest(intent: ActionIntent): ApprovalRequest {
  const risk = classifyActionRisk(intent);

  return {
    id: `approval-${Date.now()}`,
    intent,
    risk,
    reason: risk === 'safe'
      ? 'Action is informational and does not change local or remote state.'
      : 'Action can affect files, commands, environment, network or cloud context.',
    createdAt: new Date().toISOString(),
  };
}

export function requiresUserApproval(request: ApprovalRequest) {
  return request.risk === 'ask' || request.risk === 'danger';
}

