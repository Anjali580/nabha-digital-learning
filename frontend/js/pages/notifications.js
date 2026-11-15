import { api } from '../api.js';
import { notificationIcon } from '../components/cards.js';
import { icon } from '../icons.js';
import { emptyState, esc, timeAgo } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get('/api/student/notifications', { signal: ctx.signal, query: { page: 0, size: 20 } });
  const items = data?.items || data?.content || data || [];
  return `<div class="page">
    <div class="page-head">
      <div><h1>Notifications</h1><p>Your updates.</p></div>
      <button class="btn btn-outline btn-sm" id="mark-all">Mark all read</button>
    </div>
    <div class="stack-sm">
      ${items.length ? items.map((n) => {
        const [ic, color] = notificationIcon(n.type);
        return `<div class="panel" style="padding:12px;display:flex;gap:10px;align-items:flex-start">
          <span style="color:${color}">${icon(ic,16)}</span>
          <div style="flex:1">
            <strong>${esc(n.title)}</strong>
            <p style="margin:2px 0;color:var(--muted)">${esc(n.message || '')}</p>
            <small style="color:var(--muted)">${esc(timeAgo(n.createdAt))}</small>
          </div>
        </div>`;
      }).join('') : emptyState({ iconName: 'bell', title: 'No notifications', text: 'You are all caught up.' })}
    </div>
  </div>`;
}

export async function mount(ctx) {
  document.getElementById('mark-all')?.addEventListener('click', async () => {
    await api.patch('/api/student/notifications/read-all', {}, { signal: ctx.signal });
    window.location.reload();
  });
}