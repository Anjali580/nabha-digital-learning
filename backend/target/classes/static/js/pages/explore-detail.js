import { api } from '../api.js';
import { bindBookmarkActions } from '../bookmark.js';
import { icon } from '../icons.js';
import { emptyState, esc, formatDate } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get(`/api/explore/${encodeURIComponent(ctx.params.slug)}`, { signal: ctx.signal });
  const item = data || {};
  return `<div class="page">
    <article class="panel" style="padding:24px">
      <h1>${esc(item.title)}</h1>
      <p style="color:var(--muted)">${esc(item.shortDescription || '')}</p>
      <div style="margin-top:16px;line-height:1.7">${item.content || item.body || ''}</div>
      <div style="margin-top:16px;color:var(--muted);font-size:12px">Reading time: ${item.readingTimeMinutes || 3} min</div>
    </article>
  </div>`;
}

export async function mount(ctx) {
  bindBookmarkActions(ctx.root || document);
}