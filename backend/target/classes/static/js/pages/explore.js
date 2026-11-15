import { api } from '../api.js';
import { bindBookmarkActions } from '../bookmark.js';
import { exploreCard } from '../components/cards.js';
import { icon } from '../icons.js';
import { emptyState, esc, spinnerBlock } from '../ui.js';

export async function render(ctx) {
  const categories = await api.get('/api/explore/categories', { signal: ctx.signal });
  const list = await api.get('/api/explore', { signal: ctx.signal, query: { page: 0, size: 9 } });
  const cats = categories.data || [];
  const items = list.data?.items || list.data?.content || list.data || [];
  const page = list.data || {};
  return `<div class="page">
    <div class="page-head">
      <div><h1>Explore</h1><p>Discover interesting topics beyond your syllabus.</p></div>
    </div>
    <div class="chip-row" style="margin-bottom:16px">
      <a class="chip active" href="/app/explore">All</a>
      ${cats.map((c) => `<a class="chip" href="/app/explore?category=${encodeURIComponent(c.slug || c.id)}">${esc(c.title || c.name)}</a>`).join('')}
    </div>
    <div class="explore-grid">
      ${items.length ? items.map((item) => exploreCard(item)).join('') : emptyState({ iconName: 'compass', title: 'Nothing to explore yet', text: 'Check back later.' })}
    </div>
  </div>`;
}

export async function mount(ctx) {
  bindBookmarkActions(ctx.root || document);
}