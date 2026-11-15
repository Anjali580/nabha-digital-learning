import { api } from '../api.js';
import { assignmentCard } from '../components/cards.js';
import { icon } from '../icons.js';
import { emptyState, esc } from '../ui.js';

export async function render(ctx) {
  const status = ctx.query.get('status');
  const { data } = await api.get('/api/student/assignments', { signal: ctx.signal, query: { status } });
  const items = data || [];
  return `<div class="page">
    <div class="page-head"><div><h1>Assignments</h1><p>Your pending and submitted assignments.</p></div></div>
    <div class="assignment-grid">
      ${items.length ? items.map(assignmentCard).join('') : emptyState({ iconName: 'assignment', title: 'No assignments', text: 'Assignments will appear here.' })}
    </div>
  </div>`;
}