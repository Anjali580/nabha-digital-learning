import { api } from '../api.js';
import { quizCard } from '../components/cards.js';
import { icon } from '../icons.js';
import { emptyState, esc } from '../ui.js';

export async function render(ctx) {
  const subjectId = ctx.query.get('subjectId');
  const { data } = await api.get('/api/quizzes', { signal: ctx.signal, query: { subjectId } });
  const items = data || [];
  return `<div class="page">
    <div class="page-head"><div><h1>Quizzes</h1><p>Test your understanding.</p></div></div>
    <div class="quiz-grid">
      ${items.length ? items.map(quizCard).join('') : emptyState({ iconName: 'quiz', title: 'No quizzes yet', text: 'Quizzes will appear here.' })}
    </div>
  </div>`;
}