import { icon } from './icons.js';

/* ------------------------------------------------------------------ escape */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeUrl(value, fallback = '') {
  if (!value) return fallback;
  const url = String(value).trim();
  if (url.startsWith('/') || /^https?:\/\//i.test(url)) return esc(url);
  return fallback;
}

export function safeColor(value, fallback = '#0E9F6E') {
  const color = String(value || '');
  return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
}

export function tint(color, alpha = 0.13) {
  const hex = safeColor(color).replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex.slice(0, 6);
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* -------------------------------------------------------------------- utils */
export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'NL';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function firstName(name = '') {
  return String(name).trim().split(/\s+/)[0] || 'learner';
}

export function plural(count, one, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

export function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function debounce(fn, wait = 260) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = parseDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', ...options
  }).format(date);
}

export function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
  }).format(date);
}

export function timeAgo(value) {
  const date = parseDate(value);
  if (!date) return '';
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function dueInfo(value) {
  const date = parseDate(value);
  if (!date) return { text: 'No due date', tone: '' };
  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (diff < 0) return { text: `Overdue by ${Math.max(1, Math.abs(days))}d`, tone: 'danger', overdue: true };
  if (days <= 1) return { text: 'Due today', tone: 'amber' };
  if (days <= 3) return { text: `Due in ${days} days`, tone: 'amber' };
  return { text: `Due ${formatDate(date)}`, tone: '' };
}

export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—';
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  }
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function todayLabel() {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date());
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* --------------------------------------------------------------- primitives */
export function iconTile(name, color = '#0E9F6E', className = '', size = 20) {
  return `<span class="icon-tile ${className}" style="background:${tint(color, 0.13)};color:${safeColor(color)}" aria-hidden="true">${icon(name, size)}</span>`;
}

export function badge(text, tone = '') {
  return `<span class="badge ${tone}">${esc(text)}</span>`;
}

export function statusBadge(status) {
  const value = String(status || '').toUpperCase();
  const map = {
    PENDING: ['Pending', 'amber'],
    SUBMITTED: ['Submitted', 'green'],
    UNDER_REVIEW: ['Under review', 'blue'],
    REVIEWED: ['Reviewed', 'green'],
    LATE: ['Late', 'rose'],
    IN_PROGRESS: ['In progress', 'amber'],
    COMPLETED: ['Completed', 'green'],
    PASS: ['Passed', 'green'],
    FAIL: ['Needs practice', 'amber']
  };
  const [label, tone] = map[value] || [value ? value.replaceAll('_', ' ').toLowerCase() : 'Unknown', ''];
  return `<span class="badge ${tone}">${esc(label.charAt(0).toUpperCase() + label.slice(1))}</span>`;
}

export function progressBar(value, tone = '') {
  const width = clamp(value, 0, 100);
  return `<div class="progress-track ${tone}" role="progressbar" aria-valuenow="${Math.round(width)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${width}%"></span></div>`;
}

export function ring(value, label = '', size = 96, color = 'var(--brand)') {
  const width = clamp(value, 0, 100);
  return `<div class="ring" style="--ring-size:${size}px;--value:${width};--ring-color:${color}">
    <div class="ring-label"><strong>${Math.round(width)}%</strong>${label ? `<small>${esc(label)}</small>` : ''}</div>
  </div>`;
}

export function emptyState({ iconName = 'sparkles', title, text, action = '' }) {
  return `<div class="empty-state">
    <span class="icon-tile">${icon(iconName, 26)}</span>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    ${action}
  </div>`;
}

export function errorPanel(message, retry = '') {
  return `<div class="error-box" role="alert">${icon('alert', 18)}<div><strong>Something went wrong.</strong><div>${esc(message)}</div>${retry}</div></div>`;
}

export function spinnerBlock(text = 'Loading…') {
  return `<div class="panel" style="padding:40px;display:grid;place-items:center;gap:12px;color:var(--muted);font-size:12px">
    <span class="spinner" role="status" aria-label="${esc(text)}"></span><span>${esc(text)}</span>
  </div>`;
}

export function skeletonCards(count = 3, className = 'grid-3') {
  return `<div class="${className}">${Array.from({ length: count }, () =>
    '<div class="skeleton card"></div>').join('')}</div>`;
}

/* -------------------------------------------------------------------- toasts */
const ICONS = { success: 'check-circle', error: 'alert', info: 'info' };

export function toast(message, type = 'success', duration = 3600) {
  const root = document.getElementById('toasts');
  if (!root) return;
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.setAttribute('role', type === 'error' ? 'alert' : 'status');
  node.innerHTML = `${icon(ICONS[type] || 'info', 19)}<span>${esc(message)}</span>`;
  root.appendChild(node);
  const remove = () => {
    node.classList.add('leaving');
    setTimeout(() => node.remove(), 230);
  };
  const timer = setTimeout(remove, duration);
  node.addEventListener('click', () => {
    clearTimeout(timer);
    remove();
  });
}

/* --------------------------------------------------------------------- modal */
let activeModal = null;

export function closeModal() {
  if (!activeModal) return;
  activeModal.backdrop.remove();
  document.removeEventListener('keydown', activeModal.onKey);
  activeModal = null;
}

export function openModal(content, { className = '', onMount } = {}) {
  closeModal();
  const root = document.getElementById('modal-root');
  if (!root) return null;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<div class="modal ${className}" role="dialog" aria-modal="true">${content}</div>`;
  const onKey = (event) => { if (event.key === 'Escape') closeModal(); };
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeModal(); });
  document.addEventListener('keydown', onKey);
  root.appendChild(backdrop);
  activeModal = { backdrop, onKey };
  if (onMount) onMount(backdrop.querySelector('.modal'), closeModal);
  const focusable = backdrop.querySelector('button, a, input, select, textarea');
  if (focusable) focusable.focus();
  return closeModal;
}

export function confirmDialog({ title, message, confirmText = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      closeModal();
      resolve(value);
    };
    openModal(`
      <h3>${esc(title)}</h3>
      <p>${esc(message)}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-cancel>Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-confirm>${esc(confirmText)}</button>
      </div>`, {
      onMount(modal) {
        modal.querySelector('[data-cancel]').addEventListener('click', () => finish(false));
        modal.querySelector('[data-confirm]').addEventListener('click', () => finish(true));
      }
    });
    // Resolve false if the user closes with Escape or the backdrop.
    const observer = new MutationObserver(() => {
      if (!document.querySelector('.modal-backdrop')) {
        observer.disconnect();
        if (!settled) { settled = true; resolve(false); }
      }
    });
    observer.observe(document.getElementById('modal-root'), { childList: true });
  });
}

/* --------------------------------------------------------------------- forms */
export function setBusy(button, busy, busyText = 'Please wait…') {
  if (!button) return;
  if (busy) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>${esc(busyText)}</span>`;
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
  }
}

export function clearFieldErrors(form) {
  if (!form) return;
  form.querySelectorAll('.field').forEach((field) => field.classList.remove('has-error'));
  form.querySelectorAll('.error-text').forEach((node) => { node.textContent = ''; });
  form.querySelectorAll('[aria-invalid="true"]').forEach((input) => input.removeAttribute('aria-invalid'));
  const alert = form.querySelector('[data-form-error]');
  if (alert) { alert.remove(); }
}

export function showFieldErrors(form, errors = {}, fallback = '') {
  clearFieldErrors(form);
  if (!form) return;
  let first = null;
  Object.entries(errors || {}).forEach(([name, message]) => {
    const input = form.querySelector(`[name="${CSS.escape(name)}"]`);
    if (!input) return;
    const field = input.closest('.field');
    if (!field) return;
    field.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    let error = field.querySelector('.error-text');
    if (!error) {
      error = document.createElement('div');
      error.className = 'error-text';
      field.appendChild(error);
    }
    error.textContent = message;
    if (!first) first = input;
  });
  if (!Object.keys(errors || {}).length && fallback) {
    const box = document.createElement('div');
    box.className = 'error-box';
    box.dataset.formError = '';
    box.setAttribute('role', 'alert');
    box.innerHTML = `${icon('alert', 18)}<span>${esc(fallback)}</span>`;
    form.prepend(box);
  }
  if (first) first.focus({ preventScroll: false });
}

export function formValues(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (key.endsWith('[]')) {
      const clean = key.slice(0, -2);
      (data[clean] ||= []).push(value);
    } else {
      data[key] = value;
    }
  });
  return data;
}

export function passwordToggle(button) {
  const wrap = button.closest('.password-wrap');
  const input = wrap?.querySelector('input');
  if (!input) return;
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  button.innerHTML = icon(showing ? 'eye' : 'eye-off', 18);
  button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}

/* --------------------------------------------------------------------- theme */
export function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme, persist = true) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = value;
  if (persist) {
    try { localStorage.setItem('nl-theme', value); } catch { /* storage disabled */ }
  }
  document.querySelectorAll('[data-theme-icon]').forEach((node) => {
    node.innerHTML = icon(value === 'dark' ? 'sun' : 'moon', 18);
  });
  document.querySelectorAll('[data-theme-label]').forEach((node) => {
    node.textContent = value === 'dark' ? 'Light mode' : 'Dark mode';
  });
  window.dispatchEvent(new CustomEvent('nl:theme', { detail: value }));
  return value;
}

export function toggleTheme() {
  return applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

export function bindThemeToggles(root = document, onChange = null) {
  root.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.innerHTML = icon(currentTheme() === 'dark' ? 'sun' : 'moon', 18);
    button.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    button.addEventListener('click', () => {
      const next = toggleTheme();
      button.innerHTML = icon(next === 'dark' ? 'sun' : 'moon', 18);
      button.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      if (typeof onChange === 'function') {
        try { onChange(next); } catch (error) { console.warn('Theme change handler failed:', error); }
      }
    });
  });
}

/* ------------------------------------------------------------------- avatars */
export function avatar(user, sizeClass = '') {
  const name = user?.fullName || 'Student';
  const url = user?.avatarUrl ? safeUrl(user.avatarUrl) : '';
  if (url) {
    return `<span class="avatar ${sizeClass}"><img src="${url}" alt="" loading="lazy"></span>`;
  }
  return `<span class="avatar ${sizeClass}" aria-hidden="true">${esc(initials(name))}</span>`;
}

/* ------------------------------------------------------------ misc renderers */
export function sectionTitle(eyebrow, title, text = '') {
  return `<div class="section-head">
    <span class="eyebrow">${esc(eyebrow)}</span>
    <h2>${esc(title)}</h2>
    ${text ? `<p>${esc(text)}</p>` : ''}
  </div>`;
}

export function metaRow(items = []) {
  return `<div class="meta-row">${items.filter(Boolean).join('')}</div>`;
}

export function linkArrow(href, text, iconName = 'arrow-right') {
  return `<a class="link-arrow" href="${esc(href)}">${esc(text)}${icon(iconName, 14)}</a>`;
}

export function detailStat(value, label) {
  return `<div><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`;
}

export function isAbort(error) {
  return error?.name === 'AbortError' || error?.code === 'ABORTED';
}
