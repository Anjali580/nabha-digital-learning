/**
 * Central configuration for the NabhaLearn frontend.
 *
 * The API base is resolved automatically so the same build works everywhere:
 *
 *   - Running locally (localhost / 127.0.0.1): call the same origin. This works
 *     with the Spring Boot app (http://localhost:8080) and with the VS Code Live
 *     Server proxy configured in .vscode/settings.json.
 *   - Served by the Spring Boot backend: call the same origin.
 *   - Served by a separate static host (including the Render static site):
 *     call the Render backend directly.
 *
 * To override the API base without touching this file, add this to index.html:
 *
 *   <meta name="nabha-api-base" content="https://api.example.com">
 *
 * ...or set `window.NABHA_API_BASE_URL` before the app modules load.
 * Use an empty value to force same-origin requests.
 */

const RENDER_BACKEND_ORIGIN = 'https://nabha-digital-learning-backend.onrender.com';

function normalizeBase(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  return trimmed.replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
  // 1. Explicit override in the document.
  try {
    const meta = document.querySelector('meta[name="nabha-api-base"]');
    if (meta && meta.getAttribute('content')) {
      return normalizeBase(meta.getAttribute('content'));
    }
  } catch { /* not a browser document */ }

  // 2. Explicit runtime override.
  if (typeof window !== 'undefined' && typeof window.NABHA_API_BASE_URL === 'string') {
    return normalizeBase(window.NABHA_API_BASE_URL);
  }

  if (typeof window === 'undefined' || !window.location) return '';

  const { protocol, hostname } = window.location;

  // 3. Local development: use the same origin so the Live Server proxy or the
  //    backend-served build handles /api.
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
      || hostname.endsWith('.localhost')) {
    return '';
  }

  // 4. When the backend serves the app, stay on the same origin.
  if (hostname === new URL(RENDER_BACKEND_ORIGIN).hostname) return '';

  // 5. Any other web host (Render static site, custom domain, preview) uses the
  //    Render backend. CORS on the backend allows the frontend origin.
  if (protocol === 'https:' || protocol === 'http:') return RENDER_BACKEND_ORIGIN;

  return '';
}

export const CONFIG = {
  /** Base URL of the backend API. '' means same-origin. */
  API_BASE_URL: resolveApiBaseUrl(),

  /** Client verification header expected by the backend (CSRF defence). */
  CLIENT_HEADER: 'X-NabhaLearn-Client',
  CLIENT_VALUE: 'web',

  /** Request timeout in milliseconds. 0 disables the timeout. */
  REQUEST_TIMEOUT_MS: 0,

  /** Base URL used for embedded lesson videos. */
  YOUTUBE_EMBED_BASE: 'https://www.youtube-nocookie.com/embed',
};

/** Resolve an API path to a full URL using CONFIG.API_BASE_URL. */
export function apiUrl(path) {
  const base = (CONFIG.API_BASE_URL || '').replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : '/' + path;
  return base ? base + p : p;
}

/** True when the configured API lives on a different origin than the page. */
export function isCrossOriginApi() {
  if (!CONFIG.API_BASE_URL) return false;
  try {
    return new URL(CONFIG.API_BASE_URL).origin !== window.location.origin;
  } catch {
    return false;
  }
}
