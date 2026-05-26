import { AuditEvent, RiskLevel } from '../../../shared';

export function createAuditEvent(input: {
  type: string;
  message: string;
  risk?: RiskLevel;
  providerId?: string;
  modelId?: string;
}): AuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    message: input.message,
    risk: input.risk,
    providerId: input.providerId,
    modelId: input.modelId,
    createdAt: new Date().toISOString(),
  };
}

