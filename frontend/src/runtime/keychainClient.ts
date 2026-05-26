import { invoke } from '@tauri-apps/api/core';
import { KeyRefDescriptor } from '../../../shared';
import { isTauriRuntime } from './environment';

interface BackendKeyMetadata {
  label: string;
  key_ref: string;
  provider_id: string;
}

function toKeyRefDescriptor(metadata: BackendKeyMetadata): KeyRefDescriptor {
  return {
    keyRef: metadata.key_ref,
    providerId: metadata.provider_id,
    label: metadata.label,
    createdAt: new Date().toISOString(),
  };
}

export async function saveSecretToKeychain(
  providerId: string,
  label: string,
  secret: string,
): Promise<KeyRefDescriptor> {
  if (!isTauriRuntime()) {
    throw new Error('Keychain requires the Tauri desktop runtime.');
  }

  const metadata = await invoke<BackendKeyMetadata>('lyacodex_save_secret', {
    providerId,
    label,
    secret,
  });

  return toKeyRefDescriptor(metadata);
}

export async function testKeyRef(keyRef: string): Promise<boolean> {
  if (!isTauriRuntime()) {
    return false;
  }

  return invoke<boolean>('lyacodex_test_secret', { keyRef });
}

export async function deleteKeyRef(keyRef: string): Promise<void> {
  if (!isTauriRuntime()) {
    throw new Error('Keychain requires the Tauri desktop runtime.');
  }

  await invoke('lyacodex_delete_secret', { keyRef });
}

