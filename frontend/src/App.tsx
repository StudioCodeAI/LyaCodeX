import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, Cpu, FolderTree, KeyRound, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';
import { LYA_PROVIDERS } from '../../engine/src/model-gateway/providers';
import { LYA_DEFAULT_MODELS } from '../../engine/src/model-gateway/models';
import { KeyRefDescriptor, PrivacyMode, RuntimeMode } from '../../shared';
import { RuntimeChatPanel } from './components/RuntimeChatPanel';
import { ProviderSettingsPanel } from './components/ProviderSettingsPanel';
import { HybridModePanel } from './components/HybridModePanel';
import { WorkspacePanel } from './components/WorkspacePanel';
import { FirstRunWakePanel } from './components/FirstRunWakePanel';
import { LocalEnginePanel } from './components/LocalEnginePanel';
import { ActiveSkill, SkillCatalogPanel } from './components/SkillCatalogPanel';
import { createBrowserProviderGateway } from './runtime/browserProviderGateway';
import { createLyaCodexBackendClient } from './runtime/tauriBackendClient';
import { isTauriRuntime, runtimeGatewayMode } from './runtime/environment';
import { saveSecretToKeychain } from './runtime/keychainClient';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './state/settingsStore';

type ActiveView = 'wake' | 'runtime' | 'providers' | 'hybrid' | 'workspace' | 'local-engine' | 'skills';

export default function App() {
  const initialSettings = useMemo(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    return loadSettings();
  }, []);

  const [activeView, setActiveView] = useState<ActiveView>(
    initialSettings.firstRunCompleted ? 'runtime' : 'wake',
  );
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>(initialSettings.runtimeMode);
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>(initialSettings.privacyMode);
  const [savedKeys, setSavedKeys] = useState<KeyRefDescriptor[]>(initialSettings.savedKeys);
  const [selectedProviderId, setSelectedProviderId] = useState(initialSettings.selectedProviderId);
  const [selectedModelId, setSelectedModelId] = useState(initialSettings.selectedModelId);
  const [firstRunCompleted, setFirstRunCompleted] = useState(initialSettings.firstRunCompleted);
  const [activeSkill, setActiveSkill] = useState<ActiveSkill | undefined>(initialSettings.activeSkill);
  const isDesktopRuntime = useMemo(() => isTauriRuntime(), []);
  const gatewayMode = useMemo(() => runtimeGatewayMode(), []);
  const runtimeClient = useMemo(
    () => isDesktopRuntime ? createLyaCodexBackendClient() : createBrowserProviderGateway(),
    [isDesktopRuntime],
  );

  const provider = useMemo(
    () => LYA_PROVIDERS.find((item) => item.id === selectedProviderId) || LYA_PROVIDERS[0],
    [selectedProviderId],
  );

  const model = useMemo(() => {
    return (
      LYA_DEFAULT_MODELS.find((item) => item.id === selectedModelId && item.providerId === provider.id) ||
      LYA_DEFAULT_MODELS.find((item) => item.providerId === provider.id) ||
      LYA_DEFAULT_MODELS[0]
    );
  }, [provider.id, selectedModelId]);

  const selectedKey = savedKeys.find((key) => key.providerId === provider.id);

  useEffect(() => {
    saveSettings({
      selectedProviderId,
      selectedModelId: model.id,
      runtimeMode,
      privacyMode,
      savedKeys,
      firstRunCompleted,
      activeSkill,
    });
  }, [activeSkill, firstRunCompleted, model.id, privacyMode, runtimeMode, savedKeys, selectedModelId, selectedProviderId]);

  function changeProvider(providerId: string) {
    setSelectedProviderId(providerId);
    const firstModel = LYA_DEFAULT_MODELS.find((item) => item.providerId === providerId);
    setSelectedModelId(firstModel?.id);
  }

  function saveKeyRef(nextKey: KeyRefDescriptor) {
    setSavedKeys((current) => [
      ...current.filter((key) => key.keyRef !== nextKey.keyRef),
      nextKey,
    ]);
    setSelectedProviderId(nextKey.providerId);
  }

  function completeFirstRun(nextView: ActiveView) {
    setFirstRunCompleted(true);
    setActiveView(nextView);
  }

  function useRecommendedLocal(providerId: string, modelId: string) {
    setSelectedProviderId(providerId);
    setSelectedModelId(modelId);
    setRuntimeMode('local');
    setPrivacyMode('local_only');
    completeFirstRun('runtime');
  }

  function useTrialGateway() {
    setSelectedProviderId('lyacodex-trial');
    setSelectedModelId('gpt-5.5-trial');
    setRuntimeMode('cloud');
    setPrivacyMode('cloud_allowed');
    completeFirstRun('runtime');
  }

  async function testProvider(providerId: string, keyRef?: string) {
    const providerToTest = LYA_PROVIDERS.find((item) => item.id === providerId);

    if (!providerToTest) {
      throw new Error('Provider not found.');
    }

    if (providerToTest.requiresKeyRef && !keyRef) {
      throw new Error('Provider requires keyRef.');
    }

    if (providerToTest.kind === 'cloud') {
      if (!isDesktopRuntime) {
        return `${providerToTest.name} precisa do runtime Tauri/Rust para teste real com Keychain. keyRef aceito: ${keyRef}`;
      }

      return `${providerToTest.name} esta pronto para teste via backend Tauri/Rust. keyRef: ${keyRef}`;
    }

    return `${providerToTest.name} esta configurado para teste local via ${gatewayMode}. Use o Runtime para validar chamada real.`;
  }

  return (
    <main className="lyacodex-app">
      <aside className="lyacodex-sidebar">
        <div className="brand-mark">
          <BrainCircuit size={24} />
          <div>
            <strong>LyaCodex II</strong>
            <span>Runtime Lab</span>
          </div>
        </div>

        <nav>
          <button
            type="button"
            className={activeView === 'local-engine' ? 'active' : ''}
            onClick={() => setActiveView('local-engine')}
          >
            <Cpu size={18} />
            Local
          </button>
          <button
            type="button"
            className={activeView === 'runtime' ? 'active' : ''}
            onClick={() => setActiveView('runtime')}
          >
            <MessageSquareText size={18} />
            Runtime
          </button>
          <button
            type="button"
            className={activeView === 'providers' ? 'active' : ''}
            onClick={() => setActiveView('providers')}
          >
            <KeyRound size={18} />
            Providers
          </button>
          <button
            type="button"
            className={activeView === 'hybrid' ? 'active' : ''}
            onClick={() => setActiveView('hybrid')}
          >
            <ShieldCheck size={18} />
            Hybrid
          </button>
          <button
            type="button"
            className={activeView === 'workspace' ? 'active' : ''}
            onClick={() => setActiveView('workspace')}
          >
            <FolderTree size={18} />
            Workspace
          </button>
          <button
            type="button"
            className={activeView === 'skills' ? 'active' : ''}
            onClick={() => setActiveView('skills')}
          >
            <Sparkles size={18} />
            Skills
          </button>
        </nav>
      </aside>

      <section className="lyacodex-workbench">
        <header className="workbench-header">
          <div>
            <span>Se você pensa, você executa. Se você executa, você indexa.</span>
            <h1>{firstRunCompleted ? 'A LyaCodex II nasceu em modo executavel.' : 'Despertar inicial da LyaCodex II.'}</h1>
          </div>
          <div className="engine-pill">
            {provider.name} · {model.runtimeName || model.displayName} · {activeSkill ? activeSkill.name : gatewayMode}
          </div>
        </header>

        <div className="workbench-content">
          {activeView === 'wake' && (
            <FirstRunWakePanel
              onUseLocal={() => completeFirstRun('local-engine')}
              onUseTrial={useTrialGateway}
              onUseApi={() => completeFirstRun('providers')}
              onSkip={() => completeFirstRun('runtime')}
            />
          )}

          {activeView === 'local-engine' && (
            <LocalEnginePanel onUseRecommended={useRecommendedLocal} />
          )}

          {activeView === 'runtime' && (
            <RuntimeChatPanel
              client={runtimeClient}
              providerConfig={{
                provider: provider.id,
                model: model.runtimeName || model.id,
                baseUrl: provider.defaultBaseUrl || 'http://localhost:11434/v1',
                keyRef: selectedKey?.keyRef,
                gatewayMode,
              }}
              runtimeMode={runtimeMode}
              privacyMode={privacyMode}
              systemPrompt={activeSkill ? buildSkillSystemPrompt(activeSkill) : undefined}
              onOpenProviderSettings={() => setActiveView('providers')}
            />
          )}

          {activeView === 'providers' && (
            <ProviderSettingsPanel
              providers={LYA_PROVIDERS}
              models={LYA_DEFAULT_MODELS}
              selectedProviderId={provider.id}
              selectedModelId={model.id}
              savedKeys={savedKeys}
              onProviderChange={changeProvider}
              onModelChange={setSelectedModelId}
              onSaveKeyRef={saveKeyRef}
              onSaveSecret={isDesktopRuntime ? saveSecretToKeychain : undefined}
              onTestProvider={testProvider}
            />
          )}

          {activeView === 'hybrid' && (
            <HybridModePanel
              runtimeMode={runtimeMode}
              privacyMode={privacyMode}
              onRuntimeModeChange={setRuntimeMode}
              onPrivacyModeChange={setPrivacyMode}
            />
          )}

          {activeView === 'workspace' && (
            <WorkspacePanel />
          )}

          {activeView === 'skills' && (
            <SkillCatalogPanel
              activeSkill={activeSkill}
              onActivateSkill={(skill) => {
                setActiveSkill(skill);
                setFirstRunCompleted(true);
                setActiveView('runtime');
              }}
              onClearSkill={() => setActiveSkill(undefined)}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function buildSkillSystemPrompt(skill: ActiveSkill) {
  return [
    'You are LyaCodex II, a local-first software engineering runtime.',
    'Follow the active SKILL.md below when it applies to the user request.',
    'Protect secrets, respect approval gates, and do not execute destructive actions without explicit consent.',
    `Active skill: ${skill.name}`,
    `Skill source: ${skill.sourceUrl}`,
    skill.content,
  ].join('\n\n');
}
