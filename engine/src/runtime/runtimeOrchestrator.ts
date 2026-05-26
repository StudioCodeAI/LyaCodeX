import { RuntimeChatRequest, RuntimeChatResult } from '../../../shared';
import { canUseProviderWithPrivacy } from '../security/policy';
import { createAuditEvent } from './auditLog';

export interface RuntimeTransport {
  chat: (request: RuntimeChatRequest) => Promise<string>;
}

export class LyaRuntimeOrchestrator {
  constructor(private readonly transport: RuntimeTransport) {}

  async chat(request: RuntimeChatRequest): Promise<RuntimeChatResult> {
    const guard = canUseProviderWithPrivacy(request);

    if (!guard.allowed) {
      throw new Error(guard.reason);
    }

    const content = await this.transport.chat(request);
    const audit = createAuditEvent({
      type: 'runtime.chat',
      message: 'Runtime chat completed without exposing secrets.',
      providerId: request.providerId,
      modelId: request.modelId,
    });

    return {
      providerId: request.providerId,
      modelId: request.modelId,
      content,
      usedCloud: request.runtimeMode === 'cloud' || request.runtimeMode === 'hybrid',
      auditId: audit.id,
    };
  }
}

