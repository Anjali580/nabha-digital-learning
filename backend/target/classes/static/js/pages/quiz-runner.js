import { api } from '../api.js';
import { icon } from '../icons.js';
import { esc } from '../ui.js';

let attempt = null;
let answers = {};

export async function render(ctx) {
  const start = await api.post(`/api/quizzes/${encodeURIComponent(ctx.params.quizId)}/start`, {}, { signal: ctx.signal });
  attempt = start.data;
  answers = {};
  const questions = attempt.questions || [];
  return `<div class="page">
    <div class="page-head"><div><h1>${esc(attempt.title)}</h1><p>${attempt.durationMinutes} min · ${attempt.totalMarks} marks</p></div></div>
    <form id="quiz-form" class="stack-lg">
      ${questions.map((q, idx) => `<section class="panel" style="padding:16px">
        <h3>Q${idx + 1}. ${esc(q.prompt)} <span style="color:var(--muted);font-size:12px">(${q.marks} marks)</span></h3>
        <div class="stack-sm" style="margin-top:8px">
          ${(q.options || []).map((opt) => `<label style="display:block">
            <input type="radio" name="${esc(q.id)}" value="${esc(opt.key)}"> ${esc(opt.key)}. ${esc(opt.text)}
          </label>`).join('')}
        </div>
      </section>`).join('')}
      <div><button class="btn btn-primary" type="submit">Submit quiz ${icon('check',13)}</button></div>
    </form>
  </div>`;
}

export async function mount(ctx) {
  const form = document.getElementById('quiz-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const questions = attempt.questions || [];
    const ans = questions.map((q) => {
      const selected = form.querySelector(`input[name="${CSS.escape(q.id)}"]:checked`);
      return { questionId: q.id, selectedOptionKey: selected ? selected.value : null };
    });
    try {
      const { data } = await api.post(`/api/quizzes/${encodeURIComponent(ctx.params.quizId)}/submit`, {
        attemptId: attempt.attemptId,
        answers: ans
      }, { signal: ctx.signal });
      window.location.href = `/app/quizzes/results/${encodeURIComponent(data.attemptId)}`;
    } catch (err) {
      alert(err.message);
    }
  });
}