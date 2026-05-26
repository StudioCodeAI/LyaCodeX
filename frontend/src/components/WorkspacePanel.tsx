import { useMemo, useState } from 'react';
import { FileCode2, FolderTree, RefreshCw } from 'lucide-react';
import { isTauriRuntime } from '../runtime/environment';
import {
  readWorkspaceFile,
  scanWorkspace,
  WorkspaceEntry,
  WorkspaceReadResponse,
} from '../runtime/workspaceClient';
import './WorkspacePanel.css';

export function WorkspacePanel() {
  const [rootPath, setRootPath] = useState('');
  const [entries, setEntries] = useState<WorkspaceEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<WorkspaceReadResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const desktopRuntime = useMemo(() => isTauriRuntime(), []);

  async function scan() {
    if (!rootPath.trim()) {
      setMessage('Informe um caminho de projeto.');
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setSelectedFile(null);

    try {
      const response = await scanWorkspace(rootPath.trim());
      setEntries(response.entries);
      setRootPath(response.root_path);
      setMessage(response.truncated
        ? 'Workspace escaneado com limite de entradas.'
        : 'Workspace escaneado com sucesso.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Falha ao escanear workspace.');
    } finally {
      setIsLoading(false);
    }
  }

  async function openEntry(entry: WorkspaceEntry) {
    if (entry.is_dir) return;
    if (entry.sensitive) {
      setMessage('Arquivo sensivel bloqueado. O fluxo de aprovacao explicita sera implementado no Agent Runtime.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await readWorkspaceFile(rootPath, entry.relative_path);
      setSelectedFile(response);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Falha ao ler arquivo.');
    } finally {
      setIsLoading(false);
    }
  }

  const visibleEntries = entries.filter((entry) => !entry.ignored);

  return (
    <section className="workspace-panel" aria-label="Workspace Engine">
      <header>
        <div>
          <span>Workspace Engine</span>
          <h2>Abra um projeto real com leitura segura.</h2>
        </div>
        <div className={desktopRuntime ? 'workspace-runtime ready' : 'workspace-runtime blocked'}>
          {desktopRuntime ? 'Tauri filesystem ready' : 'Desktop runtime required'}
        </div>
      </header>

      <div className="workspace-toolbar">
        <input
          value={rootPath}
          onChange={(event) => setRootPath(event.target.value)}
          placeholder="Ex: E:\\GitHub\\LyaCode\\LyaCodex-II"
          disabled={!desktopRuntime || isLoading}
        />
        <button type="button" onClick={scan} disabled={!desktopRuntime || isLoading}>
          <RefreshCw size={16} />
          {isLoading ? 'Loading' : 'Scan'}
        </button>
      </div>

      {message && <div className="workspace-message">{message}</div>}

      <div className="workspace-grid">
        <div className="workspace-tree">
          {visibleEntries.length === 0 ? (
            <div className="workspace-empty">
              <FolderTree size={28} />
              <span>Nenhum workspace carregado.</span>
            </div>
          ) : (
            visibleEntries.map((entry) => (
              <button
                key={entry.relative_path}
                type="button"
                className={[
                  'workspace-entry',
                  entry.is_dir ? 'dir' : 'file',
                  entry.sensitive ? 'sensitive' : '',
                ].join(' ')}
                onClick={() => openEntry(entry)}
              >
                <span>{entry.is_dir ? 'dir' : 'file'}</span>
                <strong>{entry.relative_path}</strong>
                {entry.sensitive && <em>sensitive</em>}
              </button>
            ))
          )}
        </div>

        <div className="workspace-preview">
          {selectedFile ? (
            <>
              <div className="workspace-preview-header">
                <FileCode2 size={17} />
                <strong>{selectedFile.relative_path}</strong>
                <span>{selectedFile.bytes_read} bytes</span>
              </div>
              <pre>{selectedFile.content}</pre>
            </>
          ) : (
            <div className="workspace-empty">
              <FileCode2 size={28} />
              <span>Selecione um arquivo nao sensivel para visualizar.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WorkspacePanel;

