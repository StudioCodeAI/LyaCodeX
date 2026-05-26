import { invoke } from '@tauri-apps/api/core';
import {
  RuntimeChatClient,
  RuntimeChatRequest,
  RuntimeStatus,
  RuntimeStreamResponse,
  WakeRitual,
} from './types';

interface BackendChatResponse {
  provider_id: string;
  model_id: string;
  content: string;
  used_cloud: boolean;
}

function toBackendRequest(request: RuntimeChatRequest) {
  return {
    provider_id: request.provider,
    model_id: request.model,
    base_url: request.base_url,
    messages: request.messages,
    stream: false,
    runtime_mode: request.runtimeMode || 'hybrid',
    privacy_mode: request.privacyMode || 'ask_before_cloud',
    key_ref: request.key_ref,
  };
}

export function createLyaCodexBackendClient(): RuntimeChatClient {
  return {
    getStatus: () => invoke<RuntimeStatus>('lyacodex_runtime_status'),
    getWakeRitual: () => invoke<WakeRitual>('lyacodex_wake_ritual'),
    async streamCollect(request: RuntimeChatRequest): Promise<RuntimeStreamResponse> {
      const response = await invoke<BackendChatResponse>('lyacodex_chat_once', {
        request: toBackendRequest(request),
      });

      return {
        provider: response.provider_id,
        model: response.model_id,
        chunks: [
          {
            event_type: 'stream.done',
            message: response.used_cloud
              ? 'LyaCodex backend completed with cloud provider.'
              : 'LyaCodex backend completed with local provider.',
          },
        ],
        full_content: response.content,
      };
    },
  };
}

