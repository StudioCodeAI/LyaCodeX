import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, RefreshCw, Terminal, XCircle } from 'lucide-react';
import { inspectLocalEngines } from '../runtime/localEngineClient';
import { LocalEngineStatus } from '../runtime/types';
import './LocalEnginePanel.css';

interface LocalEnginePanelProps {
  onUseRecommended: (providerId: string, modelId: string) => void;
}

export function LocalEnginePanel({ onUseRecommended }: LocalEnginePanelProps) {
  const [status, setStatus] = useState<LocalEngineStatus>();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function refresh() {
    setLoading(true);
    setCopied(false);
    try {
      setStatus(await inspectLocalEngines());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const engine = status?.engines[0];

  async function copyInstallCommand() {
    if (!engine) return;
    await navigator.clipboard.writeText(engine.install_command);
    setCopied(true);
  }

  return (
    <section className="local-engine-panel">
      <header className="local-engine-header">
        <div>
          <span>Modelo local recomendado</span>
          <h2>OpenAI GPT Local com gpt-oss:20b</h2>
        </div>
        <button type="button" onClick={refresh} disabled={loading}>
          <RefreshCw size={17} />
          Verificar
        </button>
      </header>

      <div className="engine-status-grid">
        <StatusItem
          label="Runtime"
          ok={Boolean(engine?.reachable)}
          value={engine?.reachable ? 'Ollama ativo' : 'Ollama nao detectado'}
        />
        <StatusItem
          label="Modelo"
          ok={Boolean(engine?.model_available)}
          value={engine?.model_available ? 'gpt-oss:20b disponivel' : 'Download pendente'}
        />
        <StatusItem
          label="Provider"
          ok
          value="OpenAI-compatible local"
        />
      </div>

      {engine && (
        <div className="engine-setup">
          <p>{engine.message}</p>

          <div className="command-row">
            <Terminal size={17} />
            <code>{engine.install_command}</code>
            <button type="button" onClick={copyInstallCommand}>
              <Copy size={16} />
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="engine-actions">
            <button
              type="button"
              className="primary"
              onClick={() => onUseRecommended(status.recommended_provider_id, status.recommended_model_id)}
            >
              <CheckCircle2 size={18} />
              Usar no runtime
            </button>
            <a href={engine.install_url} target="_blank" rel="noreferrer">
              <ExternalLink size={17} />
              Baixar Ollama
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

interface StatusItemProps {
  label: string;
  value: string;
  ok: boolean;
}

function StatusItem({ label, value, ok }: StatusItemProps) {
  return (
    <div className="status-item">
      {ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
