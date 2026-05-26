import { Cloud, Cpu, Sparkles, Zap } from 'lucide-react';
import './FirstRunWakePanel.css';

interface FirstRunWakePanelProps {
  onUseLocal: () => void;
  onUseTrial: () => void;
  onUseApi: () => void;
  onSkip: () => void;
}

export function FirstRunWakePanel({ onUseLocal, onUseTrial, onUseApi, onSkip }: FirstRunWakePanelProps) {
  return (
    <section className="first-run-panel">
      <div className="wake-symbol">
        <Sparkles size={30} />
      </div>

      <div className="wake-copy">
        <span>Primeiro contato</span>
        <h2>LyaCodex II pode despertar localmente ou por API.</h2>
        <p>
          O caminho recomendado e comecar pelo modelo local OpenAI GPT Local
          usando gpt-oss:20b no Ollama. Se o usuario preferir nuvem, a chave
          fica no Keychain do sistema no app desktop.
        </p>
      </div>

      <div className="wake-actions">
        <button type="button" className="primary" onClick={onUseLocal}>
          <Cpu size={18} />
          Preparar modelo local
        </button>
        <button type="button" onClick={onUseTrial}>
          <Zap size={18} />
          Experimentar GPT Trial
        </button>
        <button type="button" onClick={onUseApi}>
          <Cloud size={18} />
          Configurar API
        </button>
        <button type="button" className="text-action" onClick={onSkip}>
          Entrar no runtime
        </button>
      </div>
    </section>
  );
}
