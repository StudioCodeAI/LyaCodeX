declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isTauriRuntime() {
  return typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);
}

export function runtimeGatewayMode() {
  return isTauriRuntime() ? 'tauri' : 'browser-local';
}

// Detecta hardware básico via browser APIs
export interface BrowserHardware {
  logicalCores: number;
  ramGb: number | null;      // deviceMemory API (Chrome only)
  gpuRenderer: string | null;
  gpuVendor: string | null;
  profile: 'leve' | 'recomendado' | 'forte' | 'desconhecido';
  suggestion: string;
}

export function detectBrowserHardware(): BrowserHardware {
  const logicalCores = navigator.hardwareConcurrency || 0;

  // deviceMemory é Chrome-only (em GB aproximado)
  const ramGb = (navigator as { deviceMemory?: number }).deviceMemory ?? null;

  // WebGL para GPU
  let gpuRenderer: string | null = null;
  let gpuVendor: string | null = null;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        gpuRenderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
        gpuVendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string;
      }
    }
  } catch { /* silencioso */ }

  // Perfil baseado no que sabemos
  let profile: BrowserHardware['profile'] = 'desconhecido';
  let suggestion = 'Para detecção completa de hardware, use o instalador desktop do LyaCodeX.';

  if (ramGb !== null && logicalCores > 0) {
    if (ramGb >= 32 && logicalCores >= 8) {
      profile = 'forte';
      suggestion = 'Seu hardware parece forte. Ollama com gpt-oss:20b deve rodar bem.';
    } else if (ramGb >= 8 && logicalCores >= 4) {
      profile = 'recomendado';
      suggestion = 'Hardware adequado para modelos locais leves (7B–13B via Ollama).';
    } else {
      profile = 'leve';
      suggestion = 'Hardware limitado detectado. Prefira providers cloud ou modelos menores.';
    }
  } else if (logicalCores >= 8) {
    profile = 'recomendado';
    suggestion = `${logicalCores} núcleos detectados. Ollama local deve funcionar bem.`;
  }

  return { logicalCores, ramGb, gpuRenderer, gpuVendor, profile, suggestion };
}
