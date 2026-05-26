import { useMemo, useState } from 'react';
import { ProviderDescriptor, KeyRefDescriptor, ModelDescriptor } from '../../../shared';
import { createProviderKeyRef } from '../../../engine/src/keychain/keyRef';
import './ProviderSettingsPanel.css';

interface ProviderSettingsPanelProps {
  providers: ProviderDescriptor[];
  models: ModelDescriptor[];
  selectedProviderId?: string;
  selectedModelId?: string;
  savedKeys?: KeyRefDescriptor[];
  onProviderChange?: (providerId: string) => void;
  onModelChange?: (modelId: string) => void;
  onSaveKeyRef?: (descriptor: KeyRefDescriptor) => void;
  onSaveSecret?: (providerId: string, label: string, secret: string) => Promise<KeyRefDescriptor>;
  onTestProvider?: (providerId: string, keyRef?: string) => Promise<string>;
}

export function ProviderSettingsPanel({
  providers,
  models,
  selectedProviderId: controlledProviderId,
  selectedModelId,
  savedKeys = [],
  onProviderChange,
  onModelChange,
  onSaveKeyRef,
  onSaveSecret,
  onTestProvider,
}: ProviderSettingsPanelProps) {
  const [internalProviderId, setInternalProviderId] = useState(providers[0]?.id || '');
  const [label, setLabel] = useState('Default Key');
  const [secret, setSecret] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const selectedProviderId = controlledProviderId || internalProviderId;

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === selectedProviderId),
    [providers, selectedProviderId],
  );

  const availableModels = useMemo(
    () => models.filter((model) => model.providerId === selectedProviderId),
    [models, selectedProviderId],
  );

  const keyRef = selectedProvider
    ? createProviderKeyRef(selectedProvider.id, label)
    : '';

  const existingKey = savedKeys.find((key) => key.keyRef === keyRef);

  async function saveReference() {
    if (!selectedProvider) return;

    setSaveResult(null);
    setIsSaving(true);

    try {
      if (selectedProvider.requiresKeyRef && onSaveSecret && secret.trim()) {
        const descriptor = await onSaveSecret(selectedProvider.id, label, secret);
        onSaveKeyRef?.(descriptor);
        setSecret('');
        setSaveResult('Secret saved in system keychain.');
        return;
      }

      if (!onSaveKeyRef) {
        setSaveResult('No keyRef handler is available.');
        return;
      }

      onSaveKeyRef({
        keyRef,
        providerId: selectedProvider.id,
        label,
        createdAt: new Date().toISOString(),
      });
      setSaveResult(selectedProvider.requiresKeyRef
        ? 'Only keyRef metadata was saved. Use desktop runtime to store the real secret.'
        : 'Local provider metadata saved.');
    } catch (err: unknown) {
      setSaveResult(err instanceof Error ? err.message : 'Failed to save keyRef.');
    } finally {
      setIsSaving(false);
    }
  }

  async function testProvider() {
    if (!selectedProvider || !onTestProvider) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await onTestProvider(
        selectedProvider.id,
        selectedProvider.requiresKeyRef ? keyRef : undefined,
      );
      setTestResult(result);
    } catch (err: unknown) {
      setTestResult(err instanceof Error ? err.message : 'Provider test failed.');
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <section className="provider-settings-panel" aria-label="Provider settings">
      <header>
        <span>Provider Manager</span>
        <h2>Configure motores sem expor secrets no frontend.</h2>
      </header>

      <div className="provider-settings-grid">
        <aside className="provider-list">
          {providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={provider.id === selectedProviderId ? 'active' : ''}
              onClick={() => {
                setInternalProviderId(provider.id);
                onProviderChange?.(provider.id);
                setTestResult(null);
              }}
            >
              <strong>{provider.name}</strong>
              <span>{provider.kind}</span>
            </button>
          ))}
        </aside>

        <div className="provider-details">
          {selectedProvider ? (
            <>
              <div className="provider-field">
                <label htmlFor="provider-key-label">Key label</label>
                <input
                  id="provider-key-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  disabled={!selectedProvider.requiresKeyRef}
                />
              </div>

              <div className="provider-keyref">
                <span>Generated keyRef</span>
                <code>{selectedProvider.requiresKeyRef ? keyRef : 'local provider does not require keyRef'}</code>
              </div>

              {selectedProvider.requiresKeyRef && (
                <div className="provider-field provider-secret-field">
                  <label htmlFor="provider-secret-input">Secret</label>
                  <input
                    id="provider-secret-input"
                    value={secret}
                    onChange={(event) => setSecret(event.target.value)}
                    type="password"
                    placeholder={onSaveSecret ? 'Stored only through desktop keychain' : 'Desktop runtime required'}
                    disabled={!onSaveSecret}
                    autoComplete="off"
                  />
                </div>
              )}

              <div className="provider-field provider-model-field">
                <label htmlFor="provider-model-select">Model</label>
                <select
                  id="provider-model-select"
                  value={selectedModelId || availableModels[0]?.id || ''}
                  onChange={(event) => onModelChange?.(event.target.value)}
                  disabled={availableModels.length === 0}
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="provider-capabilities">
                <span>{selectedProvider.openAiCompatible ? 'OpenAI-compatible' : 'custom protocol'}</span>
                <span>{selectedProvider.supportsStreaming ? 'streaming' : 'no streaming'}</span>
                <span>{selectedProvider.requiresKeyRef ? 'keyRef required' : 'local-ready'}</span>
              </div>

              <div className="provider-actions">
                <button
                  type="button"
                  onClick={saveReference}
                  disabled={isSaving || (!selectedProvider.requiresKeyRef && !onSaveKeyRef)}
                >
                  {isSaving ? 'Saving...' : existingKey ? 'KeyRef saved' : onSaveSecret ? 'Save secret' : 'Save keyRef'}
                </button>
                <button type="button" onClick={testProvider} disabled={isTesting || !onTestProvider}>
                  {isTesting ? 'Testing...' : 'Test provider'}
                </button>
              </div>

              {testResult && (
                <div className="provider-test-result">
                  {testResult}
                </div>
              )}
              {saveResult && (
                <div className="provider-test-result">
                  {saveResult}
                </div>
              )}
            </>
          ) : (
            <div className="provider-empty">No provider selected.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProviderSettingsPanel;
