import { api } from '../api.js';
import { icon } from '../icons.js';
import { esc } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get(`/api/student/quiz-attempts/${encodeURIComponent(ctx.params.attemptId)}`, { signal: ctx.signal });
  const r = data || {};
  return `<div class="page">
    <div class="panel" style="padding:24px">
      <h1>${esc(r.quizTitle)}</h1>
      <p>${esc(r.performanceMessage || '')}</p>
      <div class="meta-row" style="margin-top:12px">
        <span>Score: ${r.score}/${r.totalMarks}</span>
        <span>${Math.round(r.percentage || 0)}%</span>
        <span>${r.correctCount} correct · ${r.incorrectCount} wrong · ${r.unansweredCount} unanswered</span>
      </div>
      <div style="margin-top:16px">
        <a class="btn btn-outline" href="/app/quizzes">Back to quizzes</a>
      </div>
    </div>
  </div>`;
}