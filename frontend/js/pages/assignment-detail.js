import { api } from '../api.js';
import { icon } from '../icons.js';
import { esc } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get(`/api/student/assignments/${encodeURIComponent(ctx.params.assignmentId)}`, { signal: ctx.signal });
  const a = data || {};
  return `<div class="page">
    <div class="panel" style="padding:24px">
      <h1>${esc(a.title)}</h1>
      <p>${esc(a.description || '')}</p>
      <div class="meta-row" style="margin-top:12px">
        <span>Max marks: ${a.maxMarks}</span>
        <span>Due: ${a.dueDate || ''}</span>
      </div>
      <form id="submit-form" style="margin-top:16px">
        <textarea name="text" rows="6" style="width:100%" placeholder="Write your answer..."></textarea>
        <div style="margin-top:8px"><button class="btn btn-primary" type="submit">Submit ${icon('send',13)}</button></div>
      </form>
      ${a.submission ? `<div style="margin-top:16px"><strong>Status:</strong> ${esc(a.submission.status || '')}</div>` : ''}
    </div>
  </div>`;
}

export async function mount(ctx) {
  const form = document.getElementById('submit-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      await api.upload(`/api/student/assignments/${encodeURIComponent(ctx.params.assignmentId)}/submit`, fd, { signal: ctx.signal });
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  });
}