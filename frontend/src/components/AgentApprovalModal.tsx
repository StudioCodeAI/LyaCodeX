import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ApprovalRequest, ActionRisk } from '../../../shared/types/agent';
import './AgentApprovalModal.css';

interface Props {
  request: ApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const riskColors: Record<ActionRisk, string> = {
  safe: '#10b981',
  caution: '#f59e0b',
  danger: '#ef4444',
};

const riskIcons: Record<ActionRisk, React.ReactNode> = {
  safe: <CheckCircle size={20} style={{ color: riskColors.safe }} />,
  caution: <AlertTriangle size={20} style={{ color: riskColors.caution }} />,
  danger: <AlertTriangle size={20} style={{ color: riskColors.danger }} />,
};

export function AgentApprovalModal({ request, onApprove, onReject, isLoading = false }: Props) {
  return (
    <div className="agent-approval-backdrop">
      <div className="agent-approval-modal">
        <div className="approval-header">
          <div className="approval-icon" style={{ color: riskColors[request.risk] }}>
            {riskIcons[request.risk]}
          </div>
          <h2>Aprovar Ação</h2>
        </div>

        <div className="approval-content">
          <div className="approval-section">
            <label>Ação solicitada:</label>
            <p className="approval-action">{request.action}</p>
          </div>

          <div className="approval-section">
            <label>Descrição:</label>
            <p className="approval-description">{request.description}</p>
          </div>

          {request.command && (
            <div className="approval-section">
              <label>Comando:</label>
              <code className="approval-command">{request.command}</code>
            </div>
          )}

          {request.context && (
            <div className="approval-section">
              <label>Contexto:</label>
              <p className="approval-context">{request.context}</p>
            </div>
          )}

          <div className="approval-risk">
            <span className="risk-badge" style={{ backgroundColor: riskColors[request.risk] }}>
              {request.risk === 'safe' ? '✅ Seguro' : request.risk === 'caution' ? '⚠️ Cuidado' : '🚨 Perigoso'}
            </span>
          </div>
        </div>

        <div className="approval-actions">
          <button
            type="button"
            className="approval-btn reject"
            onClick={onReject}
            disabled={isLoading}
          >
            <XCircle size={18} />
            Rejeitar
          </button>
          <button
            type="button"
            className="approval-btn approve"
            onClick={onApprove}
            disabled={isLoading}
          >
            <CheckCircle size={18} />
            {isLoading ? 'Executando...' : 'Aprovar'}
          </button>
        </div>
      </div>
    </div>
  );
}
