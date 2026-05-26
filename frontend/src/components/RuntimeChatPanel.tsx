import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  RuntimeChatClient,
  RuntimeMessage,
  RuntimePrivacyMode,
  RuntimeProviderConfig,
  RuntimeStatus,
  RuntimeStreamChunk,
  WakeRitual,
} from '../runtime/types';
import { disconnectedRuntimeClient } from '../runtime/runtimeClient';
import './RuntimeChatPanel.css';

interface RuntimeChatPanelProps {
  client?: RuntimeChatClient;
  providerConfig: RuntimeProviderConfig;
  runtimeMode?: 'local' | 'cloud' | 'hybrid' | 'auto';
  privacyMode?: RuntimePrivacyMode;
  systemPrompt?: string;
  onOpenProviderSettings?: () => void;
}

interface UiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  state?: 'streaming' | 'done' | 'error';
}

const DEFAULT_SYSTEM_PROMPT =
  'You are LyaCodex II, a local-first software engineering runtime. Propose clear steps, protect secrets, and request approval before actions with real impact.';

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toRuntimeHistory(messages: UiMessage[]): RuntimeMessage[] {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

function mergeChunks(chunks: RuntimeStreamChunk[]) {
  return chunks
    .filter((chunk) => chunk.event_type === 'stream.token' && chunk.content)
    .map((chunk) => chunk.content)
    .join('');
}

export function RuntimeChatPanel({
  client = disconnectedRuntimeClient,
  providerConfig,
  runtimeMode = 'hybrid',
  privacyMode = 'ask_before_cloud',
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  onOpenProviderSettings,
}: RuntimeChatPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [status, setStatus] = useState<RuntimeStatus | null>(null);
  const [wake, setWake] = useState<WakeRitual | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = input.trim().length > 0 && !isRunning;
  const isCloudProvider = !['ollama', 'lmstudio', 'custom-local'].includes(providerConfig.provider);
  const needsKeyRef = isCloudProvider && !providerConfig.keyRef;
  const blocksCloud =
    isCloudProvider && privacyMode === 'local_only';

  const runtimeLabel = useMemo(() => {
    return `${providerConfig.provider} / ${providerConfig.model}`;
  }, [providerConfig.model, providerConfig.provider]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([client.getStatus(), client.getWakeRitual()])
      .then(([nextStatus, nextWake]) => {
        if (!isMounted) return;
        setStatus(nextStatus);
        setWake(nextWake);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to initialize runtime.');
      });

    return () => {
      isMounted = false;
    };
  }, [client]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function updateAssistantMessage(id: string, content: string, state: UiMessage['state']) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? { ...message, content, state }
          : message,
      ),
    );
  }

  async function submitPrompt() {
    const prompt = input.trim();
    if (!prompt || isRunning) return;

    if (blocksCloud) {
      setError('Privacy mode is local_only. Switch to a local provider or change privacy mode before using cloud.');
      return;
    }

    if (needsKeyRef) {
      setError('This provider requires a keyRef stored in Lya Keychain.');
      return;
    }

    setInput('');
    setError(null);
    setIsRunning(true);

    const userMessage: UiMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: prompt,
      state: 'done',
    };
    const assistantId = createMessageId('assistant');
    const assistantMessage: UiMessage = {
      id: assistantId,
      role: 'assistant',
      content: 'LyaCodex runtime is thinking...',
      state: 'streaming',
    };

    const nextMessages = [...messages, userMessage, assistantMessage];
    setMessages(nextMessages);

    try {
      const history = toRuntimeHistory(messages);
      const response = await client.streamCollect({
        provider: providerConfig.provider,
        model: providerConfig.model,
        base_url: providerConfig.baseUrl,
        key_ref: providerConfig.keyRef,
        runtimeMode,
        privacyMode,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: prompt },
        ],
      });

      const content = response.full_content || mergeChunks(response.chunks);
      updateAssistantMessage(
        assistantId,
        content || 'The provider returned an empty response.',
        content ? 'done' : 'error',
      );
    } catch (err: unknown) {
      updateAssistantMessage(
        assistantId,
        err instanceof Error ? err.message : 'Runtime request failed.',
        'error',
      );
    } finally {
      setIsRunning(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitPrompt();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitPrompt();
    }
  }

  function clearConversation() {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <section className="runtime-chat-panel" aria-label="LyaCodex runtime chat">
      <header className="runtime-chat-header">
        <div className="runtime-chat-title-group">
          <span className="runtime-chat-kicker">LyaCodex II Runtime</span>
          <h1>Runtime Chat Panel</h1>
          <p>{wake?.whisper || 'Before execution, LyaCodex needs a runtime breath.'}</p>
        </div>

        <div className="runtime-chat-status">
          <span className={`runtime-status-dot runtime-status-${status?.status || 'offline'}`} />
          <div>
            <strong>{status?.status || 'offline'}</strong>
            <span>{runtimeLabel}</span>
          </div>
        </div>
      </header>

      <div className="runtime-chat-meta">
        <div>
          <span>Privacy</span>
          <strong>{privacyMode}</strong>
        </div>
        <div>
          <span>Key</span>
          <strong>{providerConfig.keyRef ? 'keyRef ready' : isCloudProvider ? 'missing keyRef' : 'local'}</strong>
        </div>
        <div>
          <span>Streaming</span>
          <strong>{status?.supports_streaming ? 'live' : 'collect'}</strong>
        </div>
        <div>
          <span>Gateway</span>
          <strong>{providerConfig.gatewayMode || 'unknown'}</strong>
        </div>
      </div>

      {(error || blocksCloud || needsKeyRef) && (
        <div className="runtime-chat-warning" role="alert">
          <strong>Runtime guard</strong>
          <span>
            {error ||
              (blocksCloud
                ? 'Cloud provider blocked by local_only privacy mode.'
                : 'Cloud provider requires a keyRef before sending requests.')}
          </span>
          {needsKeyRef && onOpenProviderSettings && (
            <button type="button" onClick={onOpenProviderSettings}>
              Provider settings
            </button>
          )}
        </div>
      )}

      <div className="runtime-chat-messages">
        {messages.length === 0 ? (
          <div className="runtime-chat-empty">
            <span>{wake?.oath || 'Se você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.'}</span>
            <p>Ask for code review, planning, provider checks, or runtime diagnostics.</p>
          </div>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`runtime-message runtime-message-${message.role} runtime-message-${message.state || 'done'}`}
            >
              <div className="runtime-message-role">{message.role}</div>
              <div className="runtime-message-content">{message.content}</div>
            </article>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="runtime-chat-input-bar" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask LyaCodex to reason through the next engineering step..."
          disabled={isRunning}
        />
        <button type="button" onClick={clearConversation} disabled={isRunning || messages.length === 0}>
          Clear
        </button>
        <button type="submit" disabled={!canSend || blocksCloud || needsKeyRef}>
          Send
        </button>
      </form>
    </section>
  );
}

export default RuntimeChatPanel;
