import { ActionIntent, PrivacyMode, RiskLevel, RuntimeChatRequest } from '../../../shared';
import { getProvider } from '../model-gateway/providers';

export function classifyActionRisk(intent: ActionIntent): RiskLevel {
  if (intent.deletesFiles || intent.changesEnvironment) {
    return 'danger';
  }

  if (
    intent.command ||
    intent.network ||
    intent.writesFiles ||
    intent.sendsCloudContext
  ) {
    return 'ask';
  }

  return 'safe';
}

export function canUseProviderWithPrivacy(request: RuntimeChatRequest) {
  const provider = getProvider(request.providerId);

  if (!provider) {
    return {
      allowed: false,
      reason: `Unknown provider: ${request.providerId}`,
    };
  }

  if (provider.kind === 'cloud' && request.privacyMode === 'local_only') {
    return {
      allowed: false,
      reason: 'Privacy mode local_only blocks cloud providers.',
    };
  }

  if (provider.requiresKeyRef && !request.keyRef) {
    return {
      allowed: false,
      reason: 'Provider requires a keyRef stored in Lya Keychain.',
    };
  }

  return {
    allowed: true,
    reason: 'Provider allowed by current privacy policy.',
  };
}

export function defaultPrivacyMode(): PrivacyMode {
  return 'ask_before_cloud';
}

