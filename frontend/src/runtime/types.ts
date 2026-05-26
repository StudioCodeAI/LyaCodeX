export type RuntimeRole = 'system' | 'user' | 'assistant';

export type RuntimePrivacyMode =
  | 'local_only'
  | 'ask_before_cloud'
  | 'cloud_allowed'
  | 'auto';

export interface RuntimeMessage {
  role: RuntimeRole;
  content: string;
}

export interface RuntimeProviderConfig {
  provider: string;
  model: string;
  baseUrl: string;
  keyRef?: string;
  gatewayMode?: 'browser-local' | 'tauri' | 'mock';
}

export interface RuntimeChatRequest {
  provider: string;
  model: string;
  base_url: string;
  messages: RuntimeMessage[];
  stream: boolean;
  runtimeMode?: 'local' | 'cloud' | 'hybrid' | 'auto';
  privacyMode?: RuntimePrivacyMode;
  key_ref?: string;
}

export interface RuntimeStreamChunk {
  event_type: string;
  content?: string;
  message?: string;
}

export interface RuntimeStreamResponse {
  provider: string;
  model: string;
  chunks: RuntimeStreamChunk[];
  full_content: string;
}

export interface RuntimeStatus {
  status: string;
  message: string;
  supports_streaming: boolean;
  supports_cancel: boolean;
}

export interface WakeRitual {
  event_type: string;
  status: string;
  whisper: string;
  oath: string;
}

export interface RuntimeChatClient {
  getStatus: () => Promise<RuntimeStatus>;
  getWakeRitual: () => Promise<WakeRitual>;
  streamCollect: (request: RuntimeChatRequest) => Promise<RuntimeStreamResponse>;
}

export interface LocalEngineDescriptor {
  id: string;
  name: string;
  provider_id: string;
  base_url: string;
  health_url: string;
  models_url: string;
  install_url: string;
  recommended_model: string;
  install_command: string;
  detected: boolean;
  reachable: boolean;
  model_available: boolean;
  message: string;
}

export interface LocalEngineStatus {
  recommended_provider_id: string;
  recommended_model_id: string;
  recommended_runtime_model: string;
  engines: LocalEngineDescriptor[];
}

export interface SkillCatalogEntry {
  id: string;
  name: string;
  path: string;
  category?: string;
  description: string;
  risk?: string;
  source?: string;
  date_added?: string;
}

export interface SkillCatalogSearchRequest {
  query?: string;
  category?: string;
  risk?: string;
  limit?: number;
}

export interface SkillCatalogSearchResponse {
  source_url: string;
  attribution: string;
  entries: SkillCatalogEntry[];
  total_loaded: number;
}

export interface SkillContentResponse {
  path: string;
  source_url: string;
  content: string;
}
