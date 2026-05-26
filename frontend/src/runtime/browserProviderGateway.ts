import { LYA_PROVIDERS } from '../../../engine/src/model-gateway/providers';
import { RuntimeChatClient, RuntimeChatRequest, RuntimeStatus, RuntimeStreamResponse, WakeRitual } from './types';

interface OpenAiChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

const LOCAL_PROVIDER_IDS = new Set(['ollama', 'lmstudio', 'custom-openai']);

function chatCompletionsUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/chat/completions`;
}

function getProviderKind(providerId: string) {
  return LYA_PROVIDERS.find((p) => p.id === providerId)?.kind || 'custom';
}

// Resolve a API key real a partir do keyRef armazenado no localStorage
// O keyRef é usado como chave no mapa de secrets do browser (sem Tauri)
function resolveBrowserSecret(keyRef?: string): string | undefined {
  if (!keyRef) return undefined;
  try {
    const map = JSON.parse(localStorage.getItem('lyacodex-browser-secrets') || '{}') as Record<string, string>;
    return map[keyRef] || undefined;
  } catch {
    return undefined;
  }
}

export function saveBrowserSecret(keyRef: string, secret: string) {
  try {
    const map = JSON.parse(localStorage.getItem('lyacodex-browser-secrets') || '{}') as Record<string, string>;
    map[keyRef] = secret;
    localStorage.setItem('lyacodex-browser-secrets', JSON.stringify(map));
  } catch { /* silencioso */ }
}

export function deleteBrowserSecret(keyRef: string) {
  try {
    const map = JSON.parse(localStorage.getItem('lyacodex-browser-secrets') || '{}') as Record<string, string>;
    delete map[keyRef];
    localStorage.setItem('lyacodex-browser-secrets', JSON.stringify(map));
  } catch { /* silencioso */ }
}

async function callProvider(request: RuntimeChatRequest, apiKey?: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Headers específicos por provider
  if (request.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://github.com/LuisCard/LyaCodeX';
    headers['X-Title'] = 'LyaCodeX';
  }

  const response = await fetch(chatCompletionsUrl(request.base_url), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    let errMsg = `Provider retornou HTTP ${response.status}`;
    try {
      const errData = await response.json() as OpenAiChatResponse;
      if (errData.error?.message) errMsg = errData.error.message;
    } catch { /* silencioso */ }
    throw new Error(errMsg);
  }

  const data = await response.json() as OpenAiChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) throw new Error('Provider retornou resposta vazia.');
  return content;
}

export function createBrowserProviderGateway(): RuntimeChatClient {
  return {
    async getStatus(): Promise<RuntimeStatus> {
      return {
        status: 'breathing',
        message: 'Browser Gateway ativo. Providers locais e cloud com keyRef funcionam.',
        supports_streaming: false,
        supports_cancel: false,
      };
    },

    async getWakeRitual(): Promise<WakeRitual> {
      return {
        event_type: 'runtime.wake',
        status: 'awake',
        whisper: 'Na hora de acordar a LyaCodeX, o runtime assopra no ouvido dela.',
        oath: 'Se você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.',
      };
    },

    async streamCollect(request: RuntimeChatRequest): Promise<RuntimeStreamResponse> {
      const providerKind = getProviderKind(request.provider);
      const isLocal = LOCAL_PROVIDER_IDS.has(request.provider);

      // Bloquear cloud em modo local_only
      if (!isLocal && request.privacyMode === 'local_only') {
        throw new Error('Modo local_only ativo. Troque para um provider local ou mude o modo de privacidade.');
      }

      // Resolver API key do browser secret store
      const apiKey = resolveBrowserSecret(request.key_ref);

      // Providers cloud exigem key — mas permitir tentar mesmo sem (ex: free tiers)
      if (!isLocal && providerKind === 'cloud' && !apiKey && !request.key_ref?.startsWith('local')) {
        throw new Error(`Provider "${request.provider}" requer uma API key. Configure em Providers → salvar chave.`);
      }

      const content = await callProvider(request, apiKey);

      return {
        provider: request.provider,
        model: request.model,
        chunks: [{ event_type: 'stream.done', message: 'Concluído.' }],
        full_content: content,
      };
    },
  };
}
