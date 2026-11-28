/**
 * Single API client.
 *
 * The JWT lives in an HttpOnly cookie, so cookie-capable browsers attach it
 * automatically (`credentials: "include"` when the API is cross-origin).
 * Browsers that block third-party cookies fall back to the Bearer token from
 * localStorage, which the backend also accepts.
 *
 * Mutating requests also carry `X-NabhaLearn-Client: web`; the server rejects
 * state-changing API calls without it as a second line of CSRF defence.
 */

import { CONFIG } from './config.js';
import { clearAuthToken, getAuthToken } from './token.js';

const CLIENT_HEADER = CONFIG.CLIENT_HEADER;
const CLIENT_VALUE = CONFIG.CLIENT_VALUE;

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null, code = 'API_ERROR' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

let unauthorizedHandler = null;

const isLocalDev = () => {
  try {
    const { hostname } = window.location;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
      || hostname.endsWith('.localhost');
  } catch {
    return false;
  }
};

/** Message shown when the API cannot be reached at all. */
function backendOfflineMessage() {
  return isLocalDev()
    ? 'The NabhaLearn backend is not running. Start it with "cd backend && mvn spring-boot:run" (or run ./dev.sh), then try again.'
    : 'The learning server is temporarily unavailable. Please try again in a moment.';
}

/** Register a callback invoked whenever the server says the session expired. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function buildUrl(path, query) {
  const base = (CONFIG.API_BASE_URL || '').replace(/\/+$/, '');
  const apiPath = path.startsWith('/') ? path : '/' + path;
  const url = base
    ? new URL(base + apiPath)
    : new URL(apiPath, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
      else url.searchParams.set(key, value);
    });
  }
  return base ? url.href : (url.pathname + url.search);
}

/**
 * @param {string} path
 * @param {{method?:string, body?:any, formData?:FormData, query?:object, signal?:AbortSignal, silentAuth?:boolean, raw?:boolean}} options
 */
export async function request(path, options = {}) {
  const {
    method = 'GET', body, formData, query, signal, silentAuth = false, raw = false
  } = options;
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  const headers = { Accept: 'application/json', [CLIENT_HEADER]: CLIENT_VALUE };

  // Cookie-first, Bearer fallback. Browsers that block third-party cookies
  // still authenticate because the server accepts the Authorization header.
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;

  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const crossOrigin = Boolean(CONFIG.API_BASE_URL) && (() => {
    try { return new URL(CONFIG.API_BASE_URL).origin !== window.location.origin; }
    catch { return false; }
  })();

  // Optional client-side timeout from CONFIG.REQUEST_TIMEOUT_MS.
  let timeoutId = null;
  let timedOut = false;
  let requestSignal = signal;
  if (CONFIG.REQUEST_TIMEOUT_MS > 0 && !signal) {
    const controller = new AbortController();
    requestSignal = controller.signal;
    timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, CONFIG.REQUEST_TIMEOUT_MS);
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      credentials: crossOrigin ? 'include' : 'same-origin',
      signal: requestSignal,
      cache: 'no-store'
    });
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      if (timedOut) throw new ApiError('The request took too long. Please try again.', { status: 0, code: 'TIMEOUT' });
      throw error;
    }
    throw new ApiError(backendOfflineMessage(), { status: 0, code: 'BACKEND_OFFLINE' });
  }
  if (timeoutId) clearTimeout(timeoutId);

  if (response.status === 401) {
    clearAuthToken();
    if (!silentAuth && typeof unauthorizedHandler === 'function') unauthorizedHandler();
    let message = 'Your session has expired. Please sign in again.';
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch { /* ignore */ }
    throw new ApiError(message, { status: 401, code: 'UNAUTHORIZED' });
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try { data = await response.json(); } catch { data = null; }
  } else if (raw && response.ok) {
    return response;
  }

  if (!response.ok) {
    // A 5xx that is not JSON almost always comes from the dev proxy or a load
    // balancer: the backend itself is not listening. Show an actionable message
    // instead of the generic "Something went wrong".
    const proxyFailure = response.status >= 500 && !contentType.includes('application/json');
    if (proxyFailure || [502, 503, 504].includes(response.status)) {
      throw new ApiError(backendOfflineMessage(), { status: response.status, code: 'BACKEND_OFFLINE' });
    }
    const message = data?.message || defaultMessage(response.status);
    throw new ApiError(message, {
      status: response.status,
      errors: data?.errors || null,
      code: response.status === 403 ? 'FORBIDDEN' : 'API_ERROR'
    });
  }

  // Envelope: { success, message, data, timestamp }. Some endpoints return raw objects.
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return { data: data.data, message: data.message, success: data.success };
  }
  return { data, message: '', success: true };
}

function defaultMessage(status) {
  switch (status) {
    case 400: return 'Please check the information and try again.';
    case 403: return 'You do not have permission to do that.';
    case 404: return 'We could not find what you were looking for.';
    case 409: return 'That action conflicts with the current state.';
    case 413: return 'The file is too large. Maximum size is 5 MB.';
    case 429: return 'Too many requests. Please wait a moment and try again.';
    default: return 'Something went wrong. Please try again.';
  }
}

export const api = {
  get(path, options = {}) {
    return request(path, { ...options, method: 'GET' });
  },
  post(path, body, options = {}) {
    return request(path, { ...options, method: 'POST', body });
  },
  put(path, body, options = {}) {
    return request(path, { ...options, method: 'PUT', body });
  },
  patch(path, body, options = {}) {
    return request(path, { ...options, method: 'PATCH', body });
  },
  delete(path, options = {}) {
    return request(path, { ...options, method: 'DELETE' });
  },
  upload(path, formData, options = {}) {
    return request(path, { ...options, method: 'POST', formData });
  }
};
