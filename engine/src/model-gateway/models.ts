import { ModelDescriptor } from '../../../shared';

export const LYA_DEFAULT_MODELS: ModelDescriptor[] = [
  {
    id: 'openai-gpt-local',
    providerId: 'ollama',
    displayName: 'OpenAI GPT Local',
    runtimeName: 'gpt-oss:20b',
    local: true,
    recommendedFor: ['first-run', 'private-code', 'daily-work'],
  },
  {
    id: 'qwen2.5-coder',
    providerId: 'ollama',
    displayName: 'Qwen Coder Local',
    local: true,
    recommendedFor: ['coding', 'local-only', 'tool-calling'],
  },
  {
    id: 'gpt-5.5-trial',
    providerId: 'lyacodex-trial',
    displayName: 'GPT-5.5 Trial',
    local: false,
    recommendedFor: ['first-run', 'demo', 'upgrade-path'],
  },
  {
    id: 'gpt-5.5',
    providerId: 'openai',
    displayName: 'OpenAI GPT-5.5',
    local: false,
    recommendedFor: ['coding', 'architecture', 'hard-debugging'],
  },
  {
    id: 'gpt-5.4',
    providerId: 'openai',
    displayName: 'OpenAI GPT-5.4',
    local: false,
    recommendedFor: ['coding', 'professional-work', 'balanced-cloud'],
  },
  {
    id: 'gpt-5.4-mini',
    providerId: 'openai',
    displayName: 'OpenAI GPT-5.4 Mini',
    local: false,
    recommendedFor: ['coding', 'subagents', 'lower-cost-cloud'],
  },
  {
    id: 'gpt-4.1-mini',
    providerId: 'openai',
    displayName: 'OpenAI GPT-4.1 Mini',
    local: false,
    recommendedFor: ['legacy-api', 'compatibility'],
  },
  {
    id: 'openrouter-auto',
    providerId: 'openrouter',
    displayName: 'OpenRouter Auto',
    local: false,
    recommendedFor: ['fallback', 'provider-choice', 'cloud'],
  },
];

export function listModelsForProvider(providerId: string) {
  return LYA_DEFAULT_MODELS.filter((model) => model.providerId === providerId);
}
