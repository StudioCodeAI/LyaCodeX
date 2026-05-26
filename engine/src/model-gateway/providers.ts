import { ProviderDescriptor } from '../../../shared';

// LyaCodeX — providers oficiais
// lyacodex-trial removido: trial.lyacodex.ai ainda não existe.
// Adicionar quando o servidor estiver hospedado.

export const LYA_PROVIDERS: ProviderDescriptor[] = [
  {
    id: 'ollama',
    name: 'Ollama (OpenAI GPT Local)',
    kind: 'local',
    defaultBaseUrl: 'http://localhost:11434/v1',
    requiresKeyRef: false,
    supportsStreaming: true,
    openAiCompatible: true,
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    kind: 'local',
    defaultBaseUrl: 'http://localhost:1234/v1',
    requiresKeyRef: false,
    supportsStreaming: true,
    openAiCompatible: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    kind: 'cloud',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    requiresKeyRef: true,
    supportsStreaming: true,
    openAiCompatible: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    kind: 'cloud',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresKeyRef: true,
    supportsStreaming: true,
    openAiCompatible: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    kind: 'cloud',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    requiresKeyRef: true,
    supportsStreaming: true,
    openAiCompatible: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    kind: 'cloud',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    requiresKeyRef: true,
    supportsStreaming: true,
    openAiCompatible: false,
  },
  {
    id: 'groq',
    name: 'Groq',
    kind: 'cloud',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    requiresKeyRef: true,
    supportsStreaming: true,
    openAiCompatible: true,
  },
  {
    id: 'custom-openai',
    name: 'Custom OpenAI-Compatible',
    kind: 'custom',
    requiresKeyRef: false,
    supportsStreaming: true,
    openAiCompatible: true,
  },
];

export function getProvider(providerId: string) {
  return LYA_PROVIDERS.find((p) => p.id === providerId);
}
