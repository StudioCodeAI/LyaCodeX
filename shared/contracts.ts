export type RuntimeMode = 'local' | 'cloud' | 'hybrid' | 'auto';

export type PrivacyMode =
  | 'local_only'
  | 'ask_before_cloud'
  | 'cloud_allowed'
  | 'auto';

export type RiskLevel = 'safe' | 'ask' | 'danger';

export type ProviderKind = 'local' | 'cloud' | 'custom';

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ProviderDescriptor {
  id: string;
  name: string;
  kind: ProviderKind;
  defaultBaseUrl?: string;
  requiresKeyRef: boolean;
  supportsStreaming: boolean;
  openAiCompatible: boolean;
}

export interface ModelDescriptor {
  id: string;
  providerId: string;
  displayName: string;
  runtimeName?: string;
  contextWindow?: number;
  local: boolean;
  recommendedFor: string[];
}

export interface KeyRefDescriptor {
  keyRef: string;
  providerId: string;
  label: string;
  createdAt: string;
}

export interface RuntimeMessage {
  role: MessageRole;
  content: string;
}

export interface RuntimeChatRequest {
  providerId: string;
  modelId: string;
  baseUrl: string;
  keyRef?: string;
  messages: RuntimeMessage[];
  stream: boolean;
  privacyMode: PrivacyMode;
  runtimeMode: RuntimeMode;
}

export interface RuntimeChatResult {
  providerId: string;
  modelId: string;
  content: string;
  usedCloud: boolean;
  auditId: string;
}

export interface ActionIntent {
  title: string;
  description: string;
  command?: string;
  files?: string[];
  network?: boolean;
  writesFiles?: boolean;
  deletesFiles?: boolean;
  changesEnvironment?: boolean;
  sendsCloudContext?: boolean;
}

export interface ApprovalRequest {
  id: string;
  intent: ActionIntent;
  risk: RiskLevel;
  reason: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  type: string;
  message: string;
  risk?: RiskLevel;
  providerId?: string;
  modelId?: string;
  createdAt: string;
}
