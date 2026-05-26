import { invoke } from '@tauri-apps/api/core';
import { LocalEngineStatus } from './types';
import { isTauriRuntime } from './environment';

const OLLAMA_HEALTH = 'http://localhost:11434/api/version';
const OLLAMA_MODELS = 'http://localhost:11434/api/tags';
const OLLAMA_BASE   = 'http://localhost:11434/v1';
const LMSTUDIO_HEALTH = 'http://localhost:1234/v1/models';
const LMSTUDIO_BASE   = 'http://localhost:1234/v1';

async function pingUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
}

async function listOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(OLLAMA_MODELS, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = await res.json() as { models?: Array<{ name: string }> };
    return (data.models || []).map((m) => m.name);
  } catch {
    return [];
  }
}

async function listLmStudioModels(): Promise<string[]> {
  try {
    const res = await fetch(LMSTUDIO_HEALTH, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = await res.json() as { data?: Array<{ id: string }> };
    return (data.data || []).map((m) => m.id);
  } catch {
    return [];
  }
}

// Tenta detectar Ollama diretamente no browser (funciona se não houver CORS block)
async function inspectBrowser(): Promise<LocalEngineStatus> {
  const [ollamaOk, lmOk] = await Promise.all([
    pingUrl(OLLAMA_HEALTH),
    pingUrl(LMSTUDIO_HEALTH),
  ]);

  const ollamaModels = ollamaOk ? await listOllamaModels() : [];
  const lmModels     = lmOk    ? await listLmStudioModels() : [];

  const gptOssAvailable = ollamaModels.some((m) => m.startsWith('gpt-oss'));
  const firstOllama     = ollamaModels[0] || 'gpt-oss:20b';
  const firstLm         = lmModels[0]     || '';

  const ollamaMessage = ollamaOk
    ? gptOssAvailable
      ? `Ollama ativo. gpt-oss detectado: ${firstOllama}`
      : `Ollama ativo. Modelos: ${ollamaModels.slice(0, 3).join(', ') || 'nenhum'}. Baixe gpt-oss:20b para usar o OpenAI GPT Local.`
    : 'Ollama não detectado em localhost:11434. Instale em ollama.com/download';

  const lmMessage = lmOk
    ? `LM Studio ativo. Modelo: ${firstLm || 'nenhum carregado'}`
    : 'LM Studio não detectado em localhost:1234';

  return {
    recommended_provider_id: ollamaOk ? 'ollama' : (lmOk ? 'lmstudio' : 'ollama'),
    recommended_model_id: 'openai-gpt-local',
    recommended_runtime_model: ollamaOk ? firstOllama : (lmOk ? firstLm : 'gpt-oss:20b'),
    engines: [
      {
        id: 'ollama',
        name: 'Ollama (OpenAI GPT Local)',
        provider_id: 'ollama',
        base_url: OLLAMA_BASE,
        health_url: OLLAMA_HEALTH,
        models_url: OLLAMA_MODELS,
        install_url: 'https://ollama.com/download',
        recommended_model: 'gpt-oss:20b',
        install_command: 'ollama pull gpt-oss:20b',
        detected: ollamaOk,
        reachable: ollamaOk,
        model_available: gptOssAvailable,
        available_models: ollamaModels,
        message: ollamaMessage,
      },
      {
        id: 'lmstudio',
        name: 'LM Studio',
        provider_id: 'lmstudio',
        base_url: LMSTUDIO_BASE,
        health_url: LMSTUDIO_HEALTH,
        models_url: LMSTUDIO_BASE + '/models',
        install_url: 'https://lmstudio.ai',
        recommended_model: firstLm || 'qualquer modelo carregado',
        install_command: 'Abra o LM Studio e carregue um modelo',
        detected: lmOk,
        reachable: lmOk,
        model_available: lmModels.length > 0,
        available_models: lmModels,
        message: lmMessage,
      },
    ],
  };
}

export async function inspectLocalEngines(): Promise<LocalEngineStatus> {
  if (isTauriRuntime()) {
    return invoke<LocalEngineStatus>('lyacodex_inspect_local_engines');
  }
  return inspectBrowser();
}
