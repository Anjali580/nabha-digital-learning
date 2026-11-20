import { api } from '../api.js';
import { icon } from '../icons.js';
import { emptyState, esc, timeAgo } from '../ui.js';

function initials(name) {
  return (name || 'Student').split(/\s+/).map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

export async function render(ctx) {
  const [{ data: students }, { data: classes }] = await Promise.all([
    api.get('/api/teacher/students', { signal: ctx.signal }),
    api.get('/api/classes', { signal: ctx.signal })
  ]);
  const items = students || [];
  const classList = classes || [];
  const activeClass = ctx.query.get('classId') || '';

  return `<div class="page teacher-page">
    <div class="page-head">
      <div>
        <h1>Students</h1>
        <p>Follow progress, quizzes and assignment activity across your classes.</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-outline btn-sm" href="/app/teacher/assignments">${icon('assignment', 16)} Assignments</a>
      </div>
    </div>

    <div class="teacher-toolbar">
      <label class="teacher-search">
        ${icon('search', 16)}
        <input class="input" type="search" id="student-search" placeholder="Search by name, email or class…">
      </label>
      <label class="teacher-filter">
        <span>Class</span>
        <select class="select" id="student-class-filter">
          <option value="">All classes</option>
          ${classList.map((item) => `<option value="${esc(item.id)}" ${item.id === activeClass ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}
        </select>
      </label>
      <span class="teacher-count">${items.length} student${items.length === 1 ? '' : 's'}</span>
    </div>

    <section class="panel">
      <div class="panel-head">
        <div><h2>Class roster</h2><p>Live activity from every student</p></div>
      </div>
      <div class="panel-body ${items.length ? 'flush' : ''}">
        ${items.length ? `<div class="table-wrap">
          <table class="data-table teacher-table" id="students-table">
            <thead><tr><th>Student</th><th>Class</th><th>Topics</th><th>Quiz avg.</th><th>Assignments</th><th>Last active</th><th></th></tr></thead>
            <tbody>
              ${items.map((student) => `<tr data-class="${esc(student.classId || '')}" data-search="${esc(`${student.fullName || ''} ${student.email || ''} ${student.className || ''}`.toLowerCase())}">
                <td>
                  <div class="table-person">
                    <span class="avatar sm">${esc(initials(student.fullName))}</span>
                    <div><strong>${esc(student.fullName)}</strong><small>${esc(student.email || '')}</small></div>
                  </div>
                </td>
                <td><span class="badge">${esc(student.className || 'Class')}</span></td>
                <td><strong>${student.completedTopics || 0}</strong><small> completed</small></td>
                <td>${student.quizAttempts ? `<strong>${Math.round(student.averageQuizPercentage || 0)}%</strong><small> ${student.quizAttempts} attempt${student.quizAttempts === 1 ? '' : 's'}</small>` : '<span class="muted">—</span>'}</td>
                <td><strong>${student.submittedAssignments || 0}</strong><small> sent · ${student.pendingAssignments || 0} pending</small></td>
                <td>${student.lastActiveAt ? esc(timeAgo(student.lastActiveAt)) : '<span class="muted">No activity</span>'}</td>
                <td class="table-action">${student.email ? `<a class="btn btn-ghost btn-sm" href="mailto:${esc(student.email)}" aria-label="Email ${esc(student.fullName)}">${icon('mail', 15)} Email</a>` : ''}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="teacher-empty" id="students-empty" hidden>${emptyState({ iconName: 'search', title: 'No students match', text: 'Try a different name or choose another class.' })}</div>`
        : emptyState({ iconName: 'users', title: 'No students yet', text: 'Students will appear here after they create an account and join a class.' })}
      </div>
    </section>
  </div>`;
}

export async function mount(ctx) {
  const root = ctx.root || document;
  const search = root.querySelector('#student-search');
  const classFilter = root.querySelector('#student-class-filter');
  const rows = [...root.querySelectorAll('#students-table tbody tr')];
  const empty = root.querySelector('#students-empty');
  if (!rows.length) return;

  const apply = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const selectedClass = classFilter?.value || '';
    let visible = 0;
    rows.forEach((row) => {
      const matchText = !query || (row.dataset.search || '').includes(query);
      const matchClass = !selectedClass || row.dataset.class === selectedClass;
      const show = matchText && matchClass;
      row.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
  };

  search?.addEventListener('input', apply, { signal: ctx.signal });
  classFilter?.addEventListener('change', () => {
    apply();
    const url = new URL(window.location.href);
    if (classFilter.value) url.searchParams.set('classId', classFilter.value);
    else url.searchParams.delete('classId');
    history.replaceState({}, '', url);
  }, { signal: ctx.signal });
  apply();
}
