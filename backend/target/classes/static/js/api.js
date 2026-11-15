/**
 * Single API client. The JWT lives in an HttpOnly cookie, so every request uses
 * `credentials: "same-origin"` and the browser attaches it automatically.
 *
 * Mutating requests also carry `X-NabhaLearn-Client: web`; the server rejects
 * state-changing API calls without it as a second line of CSRF defence.
 */

const CLIENT_HEADER = 'X-NabhaLearn-Client';
const CLIENT_VALUE = 'web';

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

/** Register a callback invoked whenever the server says the session expired. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function buildUrl(path, query) {
  const url = new URL(path, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
      else url.searchParams.set(key, value);
    });
  }
  return url.pathname + url.search;
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
  let payload;

  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      credentials: 'same-origin',
      signal,
      cache: 'no-store'
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Could not reach NabhaLearn. Check your internet connection and try again.', {
      status: 0, code: 'NETWORK_ERROR'
    });
  }

  if (response.status === 401) {
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
