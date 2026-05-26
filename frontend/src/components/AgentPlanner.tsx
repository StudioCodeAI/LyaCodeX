import { AlertTriangle, CheckCircle2, Zap, Clock } from 'lucide-react';
import { ExecutionPlan, PlanStep, ActionRisk } from '../../../shared/types/agent';
import './AgentPlanner.css';

interface Props {
  plan: ExecutionPlan;
  currentStepIndex?: number;
}

const riskEmojis: Record<ActionRisk, string> = {
  safe: '✅',
  caution: '⚠️',
  danger: '🚨',
};

export function AgentPlanner({ plan, currentStepIndex = 0 }: Props) {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="agent-planner">
      <div className="planner-header">
        <h3>Plano de Execução</h3>
        <div className="planner-stats">
          <div className="stat">
            <Zap size={16} />
            <span>{plan.steps.length} passos</span>
          </div>
          <div className="stat">
            <Clock size={16} />
            <span>~{formatTime(plan.estimatedTime)}</span>
          </div>
        </div>
      </div>

      <div className="plan-steps">
        {plan.steps.map((step, index) => (
          <div
            key={step.id}
            className={`plan-step ${
              index === currentStepIndex ? 'current' : index < currentStepIndex ? 'completed' : ''
            }`}
          >
            <div className="step-number">
              {index < currentStepIndex ? (
                <CheckCircle2 size={20} className="completed-icon" />
              ) : index === currentStepIndex ? (
                <div className="current-spinner" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            <div className="step-content">
              <div className="step-header">
                <p className="step-description">{step.description}</p>
                <span className="step-risk">{riskEmojis[step.risk]}</span>
              </div>

              {step.command && (
                <code className="step-command">{step.command}</code>
              )}
            </div>

            {step.requiresApproval && (
              <div className="approval-badge">
                <AlertTriangle size={14} />
                Requer aprovação
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="planner-footer">
        <div className="risk-indicator">
          <span className={`risk-dot ${plan.riskLevel}`} />
          <span className="risk-text">
            {plan.riskLevel === 'safe'
              ? '✅ Seguro'
              : plan.riskLevel === 'caution'
                ? '⚠️ Cuidado - Requer aprovação'
                : '🚨 Perigoso - Aprovação manual'}
          </span>
        </div>
      </div>
    </div>
  );
}
