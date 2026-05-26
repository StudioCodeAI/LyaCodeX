import { KeyRefDescriptor } from '../../../shared';

export function createProviderKeyRef(providerId: string, label: string) {
  const normalizedProvider = providerId.trim().toLowerCase();
  const normalizedLabel = label.trim().toLowerCase().replace(/\s+/g, '-');
  return `secret://provider/${normalizedProvider}/${normalizedLabel}`;
}

export function describeKeyRef(providerId: string, label: string): KeyRefDescriptor {
  return {
    keyRef: createProviderKeyRef(providerId, label),
    providerId,
    label,
    createdAt: new Date().toISOString(),
  };
}

export function isValidKeyRef(value: string) {
  return /^secret:\/\/provider\/[a-z0-9-]+\/[a-z0-9-]+$/.test(value);
}

