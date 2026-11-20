/**
 * Token fallback for cross-site deployments.
 *
 * The primary session mechanism is the HttpOnly `nl_token` cookie set by the
 * backend. That works for same-site deployments and for browsers that accept
 * SameSite=None cookies. Some browsers (notably Safari with ITP, and Chrome
 * with third-party cookie blocking) refuse cookies from a different site, even
 * when the cookie is valid. In that case the backend also returns the signed
 * JWT in the login/register response and the client sends it as a Bearer token.
 *
 * The token is kept in localStorage so a refresh keeps the user signed in.
 * Logging out clears it.
 */

const KEY = 'nl_token';

let memoryToken = '';

export function getAuthToken() {
  try {
    return memoryToken || localStorage.getItem(KEY) || '';
  } catch {
    return memoryToken;
  }
}

export function setAuthToken(token) {
  memoryToken = token || '';
  try {
    if (memoryToken) localStorage.setItem(KEY, memoryToken);
    else localStorage.removeItem(KEY);
  } catch { /* storage may be disabled */ }
}

export function clearAuthToken() {
  memoryToken = '';
  try { localStorage.removeItem(KEY); } catch { /* storage may be disabled */ }
}
