import { api, setUnauthorizedHandler } from './api.js';
import { applyTheme } from './ui.js';

const listeners = new Set();

const state = {
  user: null,
  preferences: null,
  loaded: false
};

let loadingPromise = null;

function emit() {
  listeners.forEach((listener) => {
    try { listener(state); } catch (error) { console.error(error); }
  });
}

export function onAuthChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUser() {
  return state.user;
}

export function getPreferences() {
  return state.preferences;
}

export function isAuthenticated() {
  return Boolean(state.user);
}

export function setUser(user, preferences) {
  state.user = user || null;
  if (preferences !== undefined) state.preferences = preferences;
  state.loaded = true;
  emit();
}

export function updateUser(patch) {
  if (!state.user) return;
  state.user = { ...state.user, ...patch };
  emit();
}

/** Load the signed-in student once. A 401 simply means "guest". */
export async function loadSession({ force = false } = {}) {
  if (state.loaded && !force) return state.user;
  if (loadingPromise && !force) return loadingPromise;
  loadingPromise = (async () => {
    try {
      const { data } = await api.get('/api/auth/me', { silentAuth: true });
      state.user = data?.user || null;
      state.preferences = data?.preferences || null;
      if (state.user && state.preferences?.theme) {
        applyTheme(state.preferences.theme);
      }
    } catch (error) {
      if (error?.status !== 401) console.warn('Could not load session:', error.message);
      state.user = null;
      state.preferences = null;
    } finally {
      state.loaded = true;
      loadingPromise = null;
      emit();
    }
    return state.user;
  })();
  return loadingPromise;
}

export async function login(email, password) {
  const { data, message } = await api.post('/api/auth/login', { email, password });
  state.user = data?.user || null;
  const me = await api.get('/api/auth/me', { silentAuth: true }).catch(() => null);
  if (me?.data) {
    state.user = me.data.user;
    state.preferences = me.data.preferences;
    if (state.preferences?.theme) applyTheme(state.preferences.theme);
  }
  state.loaded = true;
  emit();
  return { user: state.user, message };
}

export async function register(payload) {
  const { data, message } = await api.post('/api/auth/register', payload);
  state.user = data?.user || null;
  state.loaded = true;
  const me = await api.get('/api/auth/me', { silentAuth: true }).catch(() => null);
  if (me?.data) {
    state.user = me.data.user;
    state.preferences = me.data.preferences;
    if (state.preferences?.theme) applyTheme(state.preferences.theme);
  }
  emit();
  return { user: state.user, message };
}

export async function logout() {
  try {
    await api.post('/api/auth/logout', {}, { silentAuth: true });
  } catch (error) {
    console.warn('Logout request failed:', error.message);
  }
  state.user = null;
  state.preferences = null;
  state.loaded = true;
  emit();
}

export async function refreshPreferences() {
  const { data } = await api.get('/api/student/preferences');
  state.preferences = data;
  emit();
  return data;
}

export function setPreferences(preferences) {
  state.preferences = preferences;
  if (preferences?.theme) applyTheme(preferences.theme);
  emit();
}

setUnauthorizedHandler(() => {
  if (!state.user) return;
  state.user = null;
  state.preferences = null;
  emit();
});

export const auth = {
  state,
  getUser,
  getPreferences,
  isAuthenticated,
  loadSession,
  login,
  register,
  logout,
  refreshPreferences,
  setPreferences,
  updateUser,
  setUser,
  onAuthChange
};
