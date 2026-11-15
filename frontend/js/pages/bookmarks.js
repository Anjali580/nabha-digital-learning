import { api } from '../api.js';
import { bindBookmarkActions } from '../bookmark.js';
import { bookmarkCard } from '../components/cards.js';
import { icon } from '../icons.js';
import { emptyState, esc } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get('/api/student/bookmarks', { signal: ctx.signal });
  const items = data || [];
  return `<div class="page">
    <div class="page-head"><div><h1>Bookmarks</h1><p>Saved lessons and articles.</p></div></div>
    <div class="bookmark-grid">
      ${items.length ? items.map(bookmarkCard).join('') : emptyState({ iconName: 'bookmark', title: 'No bookmarks yet', text: 'Save topics and articles to find them here.' })}
    </div>
  </div>`;
}

export async function mount(ctx) {
  bindBookmarkActions(ctx.root || document);
}