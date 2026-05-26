import { invoke } from '@tauri-apps/api/core';
import {
  RuntimeChatClient,
  RuntimeChatRequest,
  RuntimeStatus,
  RuntimeStreamResponse,
  WakeRitual,
} from './types';

export function createTauriRuntimeClient(): RuntimeChatClient {
  return {
    getStatus: () => invoke<RuntimeStatus>('lyacodex_runtime_status'),
    getWakeRitual: () => invoke<WakeRitual>('lyacodex_wake_ritual'),
    streamCollect: (request: RuntimeChatRequest) =>
      invoke<RuntimeStreamResponse>('lyacodex_chat_stream_collect', { request }),
  };
}

export const disconnectedRuntimeClient: RuntimeChatClient = {
  async getStatus() {
    return {
      status: 'offline',
      message: 'Runtime client is not connected.',
      supports_streaming: false,
      supports_cancel: false,
    };
  },
  async getWakeRitual() {
    return {
      event_type: 'runtime.wake',
      status: 'offline',
      whisper: 'Runtime client is not connected.',
      oath: 'Se você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.',
    };
  },
  async streamCollect() {
    throw new Error('Runtime client is not connected.');
  },
};

