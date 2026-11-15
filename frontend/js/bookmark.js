/**
 * Shared bookmark behaviour. Cards across Explore, Learn and Quiz pages render
 * `[data-bookmark-toggle]` buttons; this module owns the optimistic UI and the
 * real API calls so every page behaves the same way.
 */
import { api } from './api.js';
import { icon } from './icons.js';
import { toast } from './ui.js';

const bound = new WeakSet();

function paint(button, saved) {
  button.classList.toggle('saved', saved);
  button.dataset.bookmarkId = saved ? button.dataset.bookmarkId || '' : '';
  button.setAttribute('aria-label', saved ? 'Remove bookmark' : 'Save for later');
  button.setAttribute('aria-pressed', String(saved));
  const svg = button.querySelector('.icon');
  if (!svg) button.innerHTML = icon('bookmark', 15);
}

async function toggle(button) {
  const targetType = button.dataset.targetType;
  const targetId = button.dataset.targetId;
  if (!targetType || !targetId) return;
  const existing = button.dataset.bookmarkId;
  button.disabled = true;
  try {
    if (existing) {
      await api.delete(`/api/student/bookmarks/${encodeURIComponent(existing)}`);
      button.dataset.bookmarkId = '';
      paint(button, false);
      toast('Removed from your bookmarks.', 'info');
    } else {
      const { data } = await api.post('/api/student/bookmarks', { targetType, targetId });
      button.dataset.bookmarkId = data?.id || '';
      paint(button, true);
      toast('Saved to your bookmarks.', 'success');
    }
    window.dispatchEvent(new CustomEvent('nl:bookmark-changed', {
      detail: { targetType, targetId, saved: Boolean(button.dataset.bookmarkId) }
    }));
  } catch (error) {
    if (error?.name !== 'AbortError') toast(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

async function removeCard(button) {
  const id = button.dataset.bookmarkId;
  if (!id) return;
  button.disabled = true;
  try {
    await api.delete(`/api/student/bookmarks/${encodeURIComponent(id)}`);
    const card = button.closest('.bookmark-card');
    if (card) {
      card.style.transition = 'opacity .18s ease, transform .18s ease';
      card.style.opacity = '0';
      card.style.transform = 'translateY(4px)';
      window.setTimeout(() => {
        card.remove();
        const grid = document.querySelector('.bookmark-grid');
        if (grid && !grid.querySelector('.bookmark-card')) {
          window.dispatchEvent(new CustomEvent('nl:bookmarks-empty'));
        }
      }, 180);
    }
    toast('Bookmark removed.', 'info');
  } catch (error) {
    if (error?.name !== 'AbortError') toast(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

/** Bind delegated listeners once per page root (usually #main). */
export function bindBookmarkActions(root = document) {
  if (!root || bound.has(root)) return;
  bound.add(root);
  root.addEventListener('click', (event) => {
    const toggleButton = event.target.closest('[data-bookmark-toggle]');
    if (toggleButton) {
      event.preventDefault();
      event.stopPropagation();
      toggle(toggleButton);
      return;
    }
    const removeButton = event.target.closest('[data-bookmark-delete]');
    if (removeButton) {
      event.preventDefault();
      removeCard(removeButton);
    }
  });
}
