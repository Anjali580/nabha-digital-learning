import { api } from '../api.js';
import { icon } from '../icons.js';
import {
  emptyState, esc, formatDate, formatDateTime, formatFileSize, setBusy, showFieldErrors,
  statusBadge, timeAgo, toast
} from '../ui.js';

function initials(name) {
  return (name || 'Student').split(/\s+/).map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

export async function render(ctx) {
  const { data } = await api.get(`/api/teacher/assignments/${encodeURIComponent(ctx.params.assignmentId)}`, { signal: ctx.signal });
  const assignment = data?.assignment || {};
  const instructions = data?.instructions || [];
  const submissions = data?.submissions || [];
  const reviewed = submissions.filter((item) => item.status === 'REVIEWED').length;
  const pending = submissions.filter((item) => item.status !== 'REVIEWED').length;
  const progress = assignment.totalStudents
    ? Math.round((assignment.submittedCount / assignment.totalStudents) * 100) : 0;

  return `<div class="page teacher-page">
    <div class="page-head">
      <div>
        <a class="back-link" href="/app/teacher/assignments">${icon('arrow-left', 14)} All assignments</a>
        <h1>${esc(assignment.title || 'Assignment')}</h1>
        <p>${esc(assignment.className || 'Class')} · ${esc(assignment.subjectName || 'General')} · ${assignment.maxMarks || 0} marks</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-outline btn-sm" href="/app/teacher/students">${icon('users', 15)} Students</a>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-tile">
        ${icon('assignment', 18)}
        <div><strong>${assignment.submittedCount || 0}/${assignment.totalStudents || 0}</strong><span>Submitted</span></div>
      </div>
      <div class="stat-tile">
        ${icon('check-circle', 18)}
        <div><strong>${reviewed}</strong><span>Reviewed</span></div>
      </div>
      <div class="stat-tile">
        ${icon('clock', 18)}
        <div><strong>${pending}</strong><span>Awaiting review</span></div>
      </div>
      <div class="stat-tile">
        ${icon('calendar', 18)}
        <div><strong>${assignment.dueDate ? esc(formatDate(assignment.dueDate)) : 'No date'}</strong><span>Due</span></div>
      </div>
    </div>

    <div class="teacher-detail-layout">
      <aside class="stack-md">
        <section class="panel">
          <div class="panel-head"><div><h2>Assignment brief</h2><p>What students were asked to do</p></div></div>
          <div class="panel-body">
            ${assignment.description ? `<p class="teacher-brief">${esc(assignment.description)}</p>` : '<p class="muted">No description was added.</p>'}
            ${instructions.length ? `<ol class="teacher-instructions">${instructions.map((item) => `<li>${esc(item)}</li>`).join('')}</ol>` : ''}
            <div class="teacher-meta-grid">
              <div><span>Class</span><strong>${esc(assignment.className || '—')}</strong></div>
              <div><span>Subject</span><strong>${esc(assignment.subjectName || 'General')}</strong></div>
              <div><span>Max marks</span><strong>${assignment.maxMarks || 0}</strong></div>
              <div><span>Assigned</span><strong>${assignment.assignedDate ? esc(formatDate(assignment.assignedDate)) : '—'}</strong></div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><div><h2>Submission progress</h2><p>${progress}% of the class has submitted</p></div></div>
          <div class="panel-body">
            <div class="progress-track"><span style="width:${progress}%"></span></div>
            <div class="teacher-meta-grid" style="margin-top:14px">
              <div><span>Class size</span><strong>${assignment.totalStudents || 0}</strong></div>
              <div><span>Submitted</span><strong>${assignment.submittedCount || 0}</strong></div>
              <div><span>Reviewed</span><strong>${assignment.reviewedCount || 0}</strong></div>
              <div><span>Pending</span><strong>${assignment.pendingReviews || 0}</strong></div>
            </div>
          </div>
        </section>
      </aside>

      <section class="panel">
        <div class="panel-head">
          <div><h2>Submissions</h2><p>Open a student’s work to add marks and feedback.</p></div>
          <div class="teacher-review-tabs" role="tablist" aria-label="Filter submissions">
            <button class="chip active" type="button" data-review-filter="">All (${submissions.length})</button>
            <button class="chip" type="button" data-review-filter="pending">To review (${pending})</button>
            <button class="chip" type="button" data-review-filter="reviewed">Reviewed (${reviewed})</button>
          </div>
        </div>
        <div class="panel-body ${submissions.length ? 'flush' : ''}">
          ${submissions.length ? `<div class="submission-list" id="submission-list">
            ${submissions.map((item) => `<article class="submission-card" data-status="${item.status === 'REVIEWED' ? 'reviewed' : 'pending'}" data-search="${esc(`${item.studentName || ''} ${item.studentEmail || ''}`.toLowerCase())}">
              <header class="submission-head">
                <span class="avatar sm">${esc(initials(item.studentName))}</span>
                <div class="submission-person">
                  <strong>${esc(item.studentName)}</strong>
                  <span>${esc(item.studentEmail || '')} · sent ${esc(timeAgo(item.submittedAt) || formatDateTime(item.submittedAt))}</span>
                </div>
                <div class="submission-marks">
                  ${statusBadge(item.status)}
                  ${item.marks !== null && item.marks !== undefined ? `<span class="badge blue">${item.marks}/${assignment.maxMarks || 0}</span>` : ''}
                </div>
              </header>

              <div class="submission-body">
                ${item.text ? `<p class="submission-text">${esc(item.text)}</p>` : '<p class="muted">No written answer was provided.</p>'}
                ${item.fileUrl ? `<a class="submission-file" href="${esc(item.fileUrl)}" target="_blank" rel="noopener">
                  ${icon('file', 16)}
                  <span>${esc(item.fileName || 'Attachment')}<small>${esc(formatFileSize(item.fileSize))}</small></span>
                  ${icon('download', 15)}
                </a>` : ''}
                ${item.feedback ? `<div class="submission-feedback">${icon('info', 15)}<div><strong>Your feedback</strong><p>${esc(item.feedback)}</p></div></div>` : ''}
              </div>

              <form class="review-form" data-review-form data-submission="${esc(item.id)}" hidden>
                <div class="review-grid">
                  <div class="field">
                    <label for="marks-${esc(item.id)}">Marks awarded</label>
                    <input class="input" id="marks-${esc(item.id)}" name="marks" type="number" min="0" max="${assignment.maxMarks || 100}" value="${item.marks ?? ''}" required>
                    <span class="hint">Out of ${assignment.maxMarks || 0}</span>
                  </div>
                  <div class="field">
                    <label for="feedback-${esc(item.id)}">Feedback</label>
                    <textarea class="input" id="feedback-${esc(item.id)}" name="feedback" rows="2" maxlength="1000" placeholder="What went well? What should they improve?">${esc(item.feedback || '')}</textarea>
                  </div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-primary btn-sm" type="submit">${icon('check', 15)} Save review</button>
                  <button class="btn btn-ghost btn-sm" type="button" data-cancel-review>Cancel</button>
                </div>
              </form>

              <div class="submission-actions">
                <button class="btn btn-outline btn-sm" type="button" data-open-review>
                  ${icon('edit', 14)} ${item.status === 'REVIEWED' ? 'Update review' : 'Review submission'}
                </button>
              </div>
            </article>`).join('')}
          </div>
          <div class="teacher-empty" id="submissions-empty" hidden>${emptyState({ iconName: 'search', title: 'Nothing here yet', text: 'Try another filter, or wait for more students to submit.' })}</div>`
          : emptyState({
            iconName: 'clipboard',
            title: 'No submissions yet',
            text: 'Students in this class have not submitted their work yet. They will appear here as soon as they do.'
          })}
        </div>
      </section>
    </div>
  </div>`;
}

export async function mount(ctx) {
  const root = ctx.root || document;
  const cards = [...root.querySelectorAll('.submission-card')];
  const empty = root.querySelector('#submissions-empty');
  const maxMarks = Number(root.querySelector('[name="marks"]')?.max || 100);

  cards.forEach((card) => {
    const form = card.querySelector('[data-review-form]');
    const openButton = card.querySelector('[data-open-review]');
    const cancel = card.querySelector('[data-cancel-review]');

    const setOpen = (open) => {
      form.hidden = !open;
      card.classList.toggle('reviewing', open);
      if (open) {
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => form.querySelector('input[name="marks"]')?.focus(), 160);
      }
    };

    openButton?.addEventListener('click', () => setOpen(form.hidden), { signal: ctx.signal });
    cancel?.addEventListener('click', () => setOpen(false), { signal: ctx.signal });

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const marks = Number(data.get('marks'));
      const errors = {};
      if (!Number.isFinite(marks) || marks < 0) errors.marks = 'Enter the marks awarded.';
      if (marks > maxMarks) errors.marks = `Marks cannot be more than ${maxMarks}.`;
      if (Object.keys(errors).length) {
        showFieldErrors(form, errors);
        return;
      }
      const button = form.querySelector('button[type="submit"]');
      setBusy(button, true, 'Saving…');
      try {
        await api.put(`/api/teacher/submissions/${encodeURIComponent(form.dataset.submission)}/review`, {
          marks,
          feedback: String(data.get('feedback') || '').trim() || null
        }, { signal: ctx.signal });
        toast('Review saved. The student has been notified.', 'success');
        setTimeout(() => window.location.reload(), 650);
      } catch (error) {
        if (error?.name === 'AbortError') return;
        setBusy(button, false);
        if (error.errors) showFieldErrors(form, error.errors, error.message);
        else toast(error.message || 'Could not save the review.', 'error');
      }
    });
  });

  root.querySelectorAll('[data-review-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-review-filter]').forEach((item) => item.classList.toggle('active', item === button));
      const filter = button.dataset.reviewFilter || '';
      let visible = 0;
      cards.forEach((card) => {
        const show = !filter || card.dataset.status === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
    }, { signal: ctx.signal });
  });
}
