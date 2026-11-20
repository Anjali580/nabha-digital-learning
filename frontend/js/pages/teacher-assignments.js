import { api } from '../api.js';
import { icon } from '../icons.js';
import {
  emptyState, esc, formatDate, setBusy, showFieldErrors, timeAgo, toast
} from '../ui.js';

function tomorrowLocal() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(17, 0, 0, 0);
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function statusPill(item) {
  if (!item.published) return '<span class="badge amber">Draft</span>';
  if (item.pendingReviews > 0) return `<span class="badge amber">${item.pendingReviews} to review</span>`;
  return '<span class="badge green">Caught up</span>';
}

export async function render(ctx) {
  const [{ data: assignments }, { data: classes }] = await Promise.all([
    api.get('/api/teacher/assignments', { signal: ctx.signal }),
    api.get('/api/classes', { signal: ctx.signal })
  ]);
  const items = assignments || [];
  const classList = classes || [];
  const activeClass = ctx.query.get('classId') || '';
  const totalPending = items.reduce((sum, item) => sum + (item.pendingReviews || 0), 0);

  return `<div class="page teacher-page">
    <div class="page-head">
      <div>
        <h1>Assignments</h1>
        <p>Create work for a class and review what students send back.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-primary btn-sm" type="button" id="toggle-create" aria-expanded="false" aria-controls="create-panel">
          ${icon('plus', 16)} New assignment
        </button>
      </div>
    </div>

    <section class="panel create-panel" id="create-panel" hidden>
      <div class="panel-head">
        <div class="row">
          <span class="icon-tile sm">${icon('assignment', 18)}</span>
          <div><h2>Create an assignment</h2><p>Students in the chosen class are notified as soon as you publish.</p></div>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" id="close-create">${icon('close', 15)} Close</button>
      </div>
      <div class="panel-body">
        <form id="assignment-form" novalidate>
          <div class="form-grid">
            <div class="field span-2">
              <label for="assignment-title">Title</label>
              <input class="input" id="assignment-title" name="title" maxlength="140" required placeholder="e.g. Chapter 4 — practice questions">
            </div>
            <div class="field">
              <label for="assignment-class">Class</label>
              <select class="select" id="assignment-class" name="classId" required>
                <option value="">Choose class</option>
                ${classList.map((item) => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="assignment-subject">Subject <span class="optional">(optional)</span></label>
              <select class="select" id="assignment-subject" name="subjectId">
                <option value="">General / all subjects</option>
              </select>
            </div>
            <div class="field">
              <label for="assignment-due">Due date</label>
              <input class="input" id="assignment-due" name="dueDate" type="datetime-local" value="${tomorrowLocal()}">
            </div>
            <div class="field">
              <label for="assignment-marks">Maximum marks</label>
              <input class="input" id="assignment-marks" name="maxMarks" type="number" min="1" max="100" value="20" required>
            </div>
            <div class="field span-2">
              <label for="assignment-description">Description</label>
              <textarea class="input" id="assignment-description" name="description" rows="3" maxlength="1200" placeholder="A short note for your students…"></textarea>
            </div>
            <div class="field span-2">
              <label for="assignment-instructions">Instructions <span class="optional">(one per line)</span></label>
              <textarea class="input" id="assignment-instructions" name="instructions" rows="3" placeholder="Read pages 42–46&#10;Answer questions 1 to 5&#10;Attach a clear photo of your work"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit" id="create-submit">${icon('send', 15)} Publish assignment</button>
            <button class="btn btn-ghost" type="button" id="cancel-create">Cancel</button>
          </div>
        </form>
      </div>
    </section>

    <div class="teacher-toolbar">
      <label class="teacher-search">
        ${icon('search', 16)}
        <input class="input" type="search" id="assignment-search" placeholder="Search assignments or subjects…">
      </label>
      <label class="teacher-filter">
        <span>Class</span>
        <select class="select" id="assignment-class-filter">
          <option value="">All classes</option>
          ${classList.map((item) => `<option value="${esc(item.id)}" ${item.id === activeClass ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}
        </select>
      </label>
      <label class="teacher-filter">
        <span>Reviews</span>
        <select class="select" id="assignment-status-filter">
          <option value="">All</option>
          <option value="pending">Needs review</option>
          <option value="done">Caught up</option>
        </select>
      </label>
      <span class="teacher-count">${items.length} assignment${items.length === 1 ? '' : 's'}${totalPending ? ` · ${totalPending} to review` : ''}</span>
    </div>

    <section class="panel">
      <div class="panel-head">
        <div><h2>All assignments</h2><p>Open an assignment to review submissions and award marks.</p></div>
      </div>
      <div class="panel-body ${items.length ? 'flush' : ''}">
        ${items.length ? `<div class="table-wrap">
          <table class="data-table teacher-table" id="assignments-table">
            <thead><tr><th>Assignment</th><th>Class</th><th>Due</th><th>Submissions</th><th>Reviews</th><th></th></tr></thead>
            <tbody>
              ${items.map((item) => {
                const progress = item.totalStudents ? Math.round((item.submittedCount / item.totalStudents) * 100) : 0;
                return `<tr data-class="${esc(item.classId || '')}" data-pending="${item.pendingReviews > 0 ? 'pending' : 'done'}" data-search="${esc(`${item.title || ''} ${item.subjectName || ''} ${item.className || ''}`.toLowerCase())}">
                  <td>
                    <a href="/app/teacher/assignments/${esc(item.id)}"><strong>${esc(item.title)}</strong></a>
                    <small>${esc(item.subjectName || 'General')} · ${item.maxMarks} marks · added ${esc(timeAgo(item.assignedDate) || formatDate(item.assignedDate))}</small>
                  </td>
                  <td><span class="badge">${esc(item.className || 'Class')}</span></td>
                  <td><span class="table-date">${item.dueDate ? esc(formatDate(item.dueDate)) : 'No due date'}</span></td>
                  <td>
                    <strong>${item.submittedCount}/${item.totalStudents}</strong>
                    <div class="mini-progress"><span style="width:${progress}%"></span></div>
                  </td>
                  <td>${statusPill(item)}</td>
                  <td class="table-action"><a class="link-arrow" href="/app/teacher/assignments/${esc(item.id)}">${item.pendingReviews ? 'Review' : 'Open'} ${icon('arrow-right', 12)}</a></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="teacher-empty" id="assignments-empty" hidden>${emptyState({ iconName: 'search', title: 'No assignments match', text: 'Try a different search or filter.' })}</div>`
        : emptyState({
          iconName: 'assignment',
          title: 'No assignments yet',
          text: 'Create your first assignment and your students will be notified instantly.',
          action: '<button class="btn btn-primary btn-sm" type="button" data-open-create>Create assignment</button>'
        })}
      </div>
    </section>
  </div>`;
}

export async function mount(ctx) {
  const root = ctx.root || document;
  const panel = root.querySelector('#create-panel');
  const toggle = root.querySelector('#toggle-create');
  const form = root.querySelector('#assignment-form');
  const classSelect = root.querySelector('#assignment-class');
  const subjectSelect = root.querySelector('#assignment-subject');
  const submit = root.querySelector('#create-submit');

  const openPanel = (open) => {
    if (!panel) return;
    panel.hidden = !open;
    toggle?.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.classList.add('open');
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => root.querySelector('#assignment-title')?.focus(), 180);
    } else {
      panel.classList.remove('open');
    }
  };

  toggle?.addEventListener('click', () => openPanel(panel?.hidden), { signal: ctx.signal });
  root.querySelector('#close-create')?.addEventListener('click', () => openPanel(false), { signal: ctx.signal });
  root.querySelector('#cancel-create')?.addEventListener('click', () => openPanel(false), { signal: ctx.signal });
  root.querySelectorAll('[data-open-create]').forEach((button) => {
    button.addEventListener('click', () => openPanel(true), { signal: ctx.signal });
  });

  const loadSubjects = async (classId) => {
    if (!subjectSelect) return;
    subjectSelect.innerHTML = '<option value="">General / all subjects</option>';
    if (!classId) return;
    try {
      const { data } = await api.get('/api/subjects', { query: { classId }, signal: ctx.signal });
      (data || []).forEach((subject) => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        subjectSelect.appendChild(option);
      });
    } catch (error) {
      if (error?.name !== 'AbortError') console.warn('Subjects unavailable:', error.message);
    }
  };

  classSelect?.addEventListener('change', () => loadSubjects(classSelect.value), { signal: ctx.signal });
  if (classSelect?.value) loadSubjects(classSelect.value);

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const classId = String(data.get('classId') || '');
    const maxMarks = Number(data.get('maxMarks'));
    const errors = {};
    if (title.length < 3) errors.title = 'Give the assignment a clear title.';
    if (!classId) errors.classId = 'Choose a class.';
    if (!Number.isFinite(maxMarks) || maxMarks < 1 || maxMarks > 100) errors.maxMarks = 'Marks must be between 1 and 100.';
    if (Object.keys(errors).length) {
      showFieldErrors(form, errors);
      return;
    }

    const dueValue = String(data.get('dueDate') || '');
    const instructions = String(data.get('instructions') || '')
      .split('\n').map((line) => line.trim()).filter(Boolean);

    setBusy(submit, true, 'Publishing…');
    try {
      const { data: created } = await api.post('/api/teacher/assignments', {
        title,
        classId,
        subjectId: data.get('subjectId') || null,
        description: String(data.get('description') || '').trim() || null,
        instructions,
        dueDate: dueValue ? new Date(dueValue).toISOString() : null,
        maxMarks,
        published: true
      }, { signal: ctx.signal });
      toast('Assignment published. Students have been notified.', 'success');
      if (created?.id) {
        window.location.href = `/app/teacher/assignments/${encodeURIComponent(created.id)}`;
      } else {
        window.location.reload();
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setBusy(submit, false);
      if (error.errors) showFieldErrors(form, error.errors, error.message);
      else toast(error.message || 'Could not publish the assignment.', 'error');
    }
  });

  const search = root.querySelector('#assignment-search');
  const classFilter = root.querySelector('#assignment-class-filter');
  const statusFilter = root.querySelector('#assignment-status-filter');
  const rows = [...root.querySelectorAll('#assignments-table tbody tr')];
  const empty = root.querySelector('#assignments-empty');

  const applyFilters = () => {
    if (!rows.length) return;
    const query = (search?.value || '').trim().toLowerCase();
    const selectedClass = classFilter?.value || '';
    const status = statusFilter?.value || '';
    let visible = 0;
    rows.forEach((row) => {
      const matchText = !query || (row.dataset.search || '').includes(query);
      const matchClass = !selectedClass || row.dataset.class === selectedClass;
      const matchStatus = !status || row.dataset.pending === status;
      const show = matchText && matchClass && matchStatus;
      row.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
  };

  search?.addEventListener('input', applyFilters, { signal: ctx.signal });
  classFilter?.addEventListener('change', () => {
    applyFilters();
    const url = new URL(window.location.href);
    if (classFilter.value) url.searchParams.set('classId', classFilter.value);
    else url.searchParams.delete('classId');
    history.replaceState({}, '', url);
  }, { signal: ctx.signal });
  statusFilter?.addEventListener('change', applyFilters, { signal: ctx.signal });
  applyFilters();
}
