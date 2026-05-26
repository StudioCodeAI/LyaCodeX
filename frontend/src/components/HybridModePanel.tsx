import { RuntimeMode, PrivacyMode } from '../../../shared';
import { detectBrowserHardware } from '../runtime/environment';
import { useMemo } from 'react';
import './HybridModePanel.css';

interface HybridModePanelProps {
  runtimeMode: RuntimeMode;
  privacyMode: PrivacyMode;
  onRuntimeModeChange: (mode: RuntimeMode) => void;
  onPrivacyModeChange: (mode: PrivacyMode) => void;
}

const RUNTIME_MODES: Array<{
  id: RuntimeMode;
  title: string;
  emoji: string;
  description: string;
  detail: string;
}> = [
  {
    id: 'local',
    title: 'Local',
    emoji: '🖥️',
    description: 'Rotina, privacidade e custo zero.',
    detail: 'Toda requisição vai para o motor local (Ollama / LM Studio). Nada sai da sua máquina.',
  },
  {
    id: 'cloud',
    title: 'Cloud',
    emoji: '☁️',
    description: 'Força premium sob demanda.',
    detail: 'Usa modelos online (OpenAI, Gemini, Claude). Exige API key configurada.',
  },
  {
    id: 'hybrid',
    title: 'Hybrid',
    emoji: '⚡',
    description: 'Começa local, escala quando necessário.',
    detail: 'A Lya inicia no motor local. Quando a tarefa é complexa, ela avisa e pede para escalar ao irmão mais velho online.',
  },
  {
    id: 'auto',
    title: 'Auto',
    emoji: '🧠',
    description: 'A Lya decide sozinha.',
    detail: 'Roteamento inteligente por complexidade, tamanho do contexto, hardware e modo de privacidade. Tarefas simples → local. Arquitetura, análise pesada → cloud.',
  },
];

const PRIVACY_MODES: Array<{ id: PrivacyMode; title: string; description: string }> = [
  { id: 'local_only',       title: '🔒 Só Local',          description: 'Nenhum dado sai da máquina.' },
  { id: 'ask_before_cloud', title: '⚠️ Perguntar',         description: 'Pede aprovação antes de enviar para cloud.' },
  { id: 'cloud_allowed',    title: '✅ Cloud liberado',     description: 'Pode usar cloud sem confirmação.' },
  { id: 'auto',             title: '🤖 Auto',               description: 'Decide com base no modo runtime.' },
];

// Lógica de decisão do modo Auto explicada ao usuário
function autoDecisionExplainer(privacyMode: PrivacyMode): string[] {
  const rules: string[] = [
    '• Mensagem curta e simples → motor local',
    '• Contexto > 4000 tokens → pode escalar para cloud',
    '• Tarefa de arquitetura ou análise complexa → cloud recomendado',
    '• Código sensível detectado → força local',
  ];
  if (privacyMode === 'local_only') {
    rules.push('• Privacy: local_only → nunca escala, ignora complexidade');
  } else if (privacyMode === 'ask_before_cloud') {
    rules.push('• Privacy: ask → avisa antes de escalar');
  } else if (privacyMode === 'cloud_allowed') {
    rules.push('• Privacy: cloud_allowed → escala sem confirmação');
  }
  return rules;
}

export function HybridModePanel({
  runtimeMode,
  privacyMode,
  onRuntimeModeChange,
  onPrivacyModeChange,
}: HybridModePanelProps) {
  const hw = useMemo(() => detectBrowserHardware(), []);

  const selectedMode = RUNTIME_MODES.find((m) => m.id === runtimeMode) || RUNTIME_MODES[2];

  return (
    <section className="hybrid-mode-panel" aria-label="Hybrid intelligence mode">
      <header>
        <span>Hybrid Intelligence</span>
        <h2>Local para rotina. Cloud para potência. A Lya decide quando escalar.</h2>
        <p>O motor local cria confiança. O irmão mais velho online entrega força quando necessário.</p>
      </header>

      {/* Hardware detectado */}
      <div className="hw-banner">
        <div className="hw-badge hw-badge--profile" data-profile={hw.profile}>
          {hw.profile === 'forte'        ? '💪 Hardware Forte'      :
           hw.profile === 'recomendado'  ? '✅ Hardware Adequado'   :
           hw.profile === 'leve'         ? '⚡ Hardware Leve'       :
                                           '🔍 Hardware Desconhecido'}
        </div>
        <div className="hw-details">
          {hw.logicalCores > 0 && <span>🧠 {hw.logicalCores} núcleos lógicos</span>}
          {hw.ramGb          && <span>💾 ~{hw.ramGb} GB RAM</span>}
          {hw.gpuRenderer    && <span>🎮 {hw.gpuRenderer.slice(0, 40)}</span>}
          {!hw.logicalCores && !hw.ramGb && <span>Dados de hardware limitados no navegador</span>}
        </div>
        <p className="hw-suggestion">{hw.suggestion}</p>
      </div>

      {/* Seletor de modo runtime */}
      <div className="mode-card-grid">
        {RUNTIME_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`mode-card ${runtimeMode === mode.id ? 'active' : ''}`}
            onClick={() => onRuntimeModeChange(mode.id)}
          >
            <div className="mode-card-top">
              <span className="mode-emoji">{mode.emoji}</span>
              <strong>{mode.title}</strong>
            </div>
            <span className="mode-description">{mode.description}</span>
          </button>
        ))}
      </div>

      {/* Detalhe do modo selecionado */}
      <div className="mode-detail-box">
        <strong>{selectedMode.emoji} {selectedMode.title}</strong>
        <p>{selectedMode.detail}</p>

        {runtimeMode === 'hybrid' && (
          <div className="hybrid-flow">
            <span>🖥️ Local</span>
            <span className="flow-arrow">→</span>
            <span>⚡ Tarefa complexa</span>
            <span className="flow-arrow">→</span>
            <span>⚠️ Lya avisa</span>
            <span className="flow-arrow">→</span>
            <span>✅ Você aprova</span>
            <span className="flow-arrow">→</span>
            <span>☁️ Cloud</span>
          </div>
        )}

        {runtimeMode === 'auto' && (
          <ul className="auto-rules">
            {autoDecisionExplainer(privacyMode).map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Privacidade */}
      <div className="privacy-section">
        <h3>Modo de privacidade</h3>
        <div className="privacy-grid">
          {PRIVACY_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`privacy-card ${privacyMode === mode.id ? 'active' : ''}`}
              onClick={() => onPrivacyModeChange(mode.id)}
            >
              <strong>{mode.title}</strong>
              <span>{mode.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compatibilidade */}
      <div className="compat-note">
        <strong>Como o Hybrid funciona na prática:</strong>
        <ol>
          <li>Você faz uma pergunta no Runtime Chat.</li>
          <li>A Lya verifica o tamanho e a complexidade da mensagem.</li>
          <li>Se local basta → responde direto pelo motor local.</li>
          <li>Se a tarefa exige mais → a Lya informa e pede sua aprovação para escalar para o provider cloud ativo.</li>
          <li>Você decide: continuar local ou escalar.</li>
        </ol>
      </div>
    </section>
  );
}

export default HybridModePanel;
