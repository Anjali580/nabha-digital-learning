import { api } from '../api.js';
import { icon } from '../icons.js';
import { esc } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get(`/api/quizzes/${encodeURIComponent(ctx.params.quizId)}`, { signal: ctx.signal });
  const q = data.summary || data;
  const instructions = data.instructions || [];
  return `<div class="page">
    <div class="panel" style="padding:24px">
      <h1>${esc(q.title)}</h1>
      <p>${esc(q.description || '')}</p>
      <div class="meta-row" style="margin-top:12px">
        <span>${q.questionCount} questions</span>
        <span>${q.durationMinutes} min</span>
        <span>${q.totalMarks} marks</span>
      </div>
      <ul style="margin-top:12px">${instructions.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      <div style="margin-top:16px">
        <a class="btn btn-primary" href="/app/quizzes/${encodeURIComponent(ctx.params.quizId)}/attempt">Start quiz ${icon('arrow-right',13)}</a>
      </div>
    </div>
  </div>`;
}