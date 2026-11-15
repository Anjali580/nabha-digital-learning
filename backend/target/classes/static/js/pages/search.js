import { api } from '../api.js';
import { icon } from '../icons.js';
import { emptyState, esc } from '../ui.js';

export async function render(ctx) {
  const q = ctx.query.get('q') || '';
  let results = [];
  if (q) {
    const { data } = await api.get('/api/student/search', { signal: ctx.signal, query: { q } });
    results = data?.results || data?.items || data || [];
  }
  return `<div class="page">
    <div class="page-head"><div><h1>Search</h1><p>Find topics, quizzes and articles.</p></div></div>
    <form action="/app/search" method="get" style="margin-bottom:16px">
      <input name="q" value="${esc(q)}" placeholder="Search..." style="padding:8px;width:60%">
      <button class="btn btn-primary" type="submit">Search</button>
    </form>
    <div class="stack-sm">
      ${q && !results.length ? emptyState({ iconName: 'search', title: 'No results', text: 'Try another keyword.' }) : ''}
      ${results.map((r) => `<div class="panel" style="padding:12px"><a href="${esc(r.link || '#')}">${esc(r.title)}</a><p style="color:var(--muted)">${esc(r.subtitle || '')}</p></div>`).join('')}
    </div>
  </div>`;
}