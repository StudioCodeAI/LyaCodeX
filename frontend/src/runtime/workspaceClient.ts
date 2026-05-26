import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime } from './environment';

export interface WorkspaceEntry {
  name: string;
  relative_path: string;
  is_dir: boolean;
  size?: number;
  ignored: boolean;
  sensitive: boolean;
}

export interface WorkspaceScanResponse {
  root_path: string;
  entries: WorkspaceEntry[];
  truncated: boolean;
}

export interface WorkspaceReadResponse {
  relative_path: string;
  content: string;
  bytes_read: number;
  truncated: boolean;
  sensitive: boolean;
}

export async function scanWorkspace(rootPath: string): Promise<WorkspaceScanResponse> {
  if (!isTauriRuntime()) {
    throw new Error('Workspace scan requires the Tauri desktop runtime.');
  }

  return invoke<WorkspaceScanResponse>('lyacodex_scan_workspace', {
    request: {
      root_path: rootPath,
      max_depth: 5,
      max_entries: 800,
    },
  });
}

export async function readWorkspaceFile(
  rootPath: string,
  relativePath: string,
): Promise<WorkspaceReadResponse> {
  if (!isTauriRuntime()) {
    throw new Error('Workspace file read requires the Tauri desktop runtime.');
  }

  return invoke<WorkspaceReadResponse>('lyacodex_read_workspace_file', {
    request: {
      root_path: rootPath,
      relative_path: relativePath,
      max_bytes: 128 * 1024,
    },
  });
}

