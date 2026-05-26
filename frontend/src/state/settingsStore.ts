import { KeyRefDescriptor, PrivacyMode, RuntimeMode } from '../../../shared';

export interface ActiveSkill {
  id: string;
  name: string;
  path: string;
  sourceUrl: string;
  content: string;
}

export interface LyaCodexSettings {
  selectedProviderId: string;
  selectedModelId?: string;
  runtimeMode: RuntimeMode;
  privacyMode: PrivacyMode;
  savedKeys: KeyRefDescriptor[];
  firstRunCompleted: boolean;
  // Múltiplas skills ativas — até MAX_ACTIVE_SKILLS
  activeSkills: ActiveSkill[];
  // URL base customizada por provider (ex: Ollama em porta diferente)
  customBaseUrls: Record<string, string>;
}

export const MAX_ACTIVE_SKILLS = 5;

const SETTINGS_KEY = 'lyacodex-settings-v2';

export const DEFAULT_SETTINGS: LyaCodexSettings = {
  selectedProviderId: 'ollama',
  selectedModelId: 'openai-gpt-local',
  runtimeMode: 'hybrid',
  privacyMode: 'ask_before_cloud',
  savedKeys: [],
  firstRunCompleted: false,
  activeSkills: [],
  customBaseUrls: {},
};

export function loadSettings(): LyaCodexSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return migrateOldSettings();
    const parsed = JSON.parse(raw) as Partial<LyaCodexSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      savedKeys: parsed.savedKeys || [],
      firstRunCompleted: parsed.firstRunCompleted ?? false,
      activeSkills: parsed.activeSkills || [],
      customBaseUrls: parsed.customBaseUrls || {},
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Migra settings da versão anterior (activeSkill singular)
function migrateOldSettings(): LyaCodexSettings {
  try {
    const raw = window.localStorage.getItem('lyacodex-ii-settings-v1');
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const oldSkill = parsed.activeSkill as ActiveSkill | undefined;
    return {
      ...DEFAULT_SETTINGS,
      selectedProviderId: (parsed.selectedProviderId as string) || DEFAULT_SETTINGS.selectedProviderId,
      selectedModelId: parsed.selectedModelId as string | undefined,
      runtimeMode: (parsed.runtimeMode as RuntimeMode) || DEFAULT_SETTINGS.runtimeMode,
      privacyMode: (parsed.privacyMode as PrivacyMode) || DEFAULT_SETTINGS.privacyMode,
      savedKeys: (parsed.savedKeys as KeyRefDescriptor[]) || [],
      firstRunCompleted: (parsed.firstRunCompleted as boolean) ?? false,
      activeSkills: oldSkill ? [oldSkill] : [],
      customBaseUrls: {},
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: LyaCodexSettings) {
  const safe: LyaCodexSettings = {
    ...settings,
    savedKeys: settings.savedKeys.map((k) => ({
      keyRef: k.keyRef,
      providerId: k.providerId,
      label: k.label,
      createdAt: k.createdAt,
    })),
    activeSkills: settings.activeSkills.slice(0, MAX_ACTIVE_SKILLS),
    customBaseUrls: settings.customBaseUrls,
  };
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(safe));
}

// Helpers para gerenciar skills ativas
export function addSkill(current: ActiveSkill[], skill: ActiveSkill): ActiveSkill[] {
  const exists = current.some((s) => s.id === skill.id);
  if (exists) return current;
  const next = [...current, skill];
  return next.slice(0, MAX_ACTIVE_SKILLS);
}

export function removeSkill(current: ActiveSkill[], skillId: string): ActiveSkill[] {
  return current.filter((s) => s.id !== skillId);
}

export function toggleSkill(current: ActiveSkill[], skill: ActiveSkill): ActiveSkill[] {
  const exists = current.some((s) => s.id === skill.id);
  if (exists) return removeSkill(current, skill.id);
  return addSkill(current, skill);
}
