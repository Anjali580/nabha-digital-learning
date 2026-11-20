import { api } from '../api.js';
import { auth } from '../auth.js';
import { statTile } from '../components/cards.js';
import { setShellStats } from '../components/layout.js';
import { icon } from '../icons.js';
import {
  dueInfo, emptyState, esc, firstName, formatDate, greeting, iconTile, statusBadge, timeAgo
} from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get('/api/teacher/dashboard', { signal: ctx.signal });
  const user = auth.getUser();
  const classes = data.classes || [];
  const assignments = data.assignments || [];
  const students = data.students || [];
  const submissions = data.recentSubmissions || [];
  const name = data.firstName || firstName(user?.fullName);

  setShellStats({
    unread: data.unreadNotifications || 0,
    pending: data.pendingReviews || 0,
    totalStudents: data.totalStudents || 0
  });

  return `<div class="page teacher-page">
    <div class="welcome-banner teacher-banner">
      <div>
        <span class="welcome-tag">${icon('graduation', 12)} Teacher workspace</span>
        <h1 style="margin-top:9px">${esc(greeting())}, ${esc(name)}.</h1>
        <p>Guide your classes, publish assignments and keep an eye on every learner’s progress.</p>
        <div class="row">
          <span class="welcome-tag">${icon('award', 12)} ${esc(data.degree || 'Teacher')}</span>
          <span class="welcome-tag">${icon('school', 12)} ${esc(data.schoolName || 'NabhaLearn')}</span>
          <span class="welcome-tag">${icon('users', 12)} ${data.totalStudents || 0} students</span>
        </div>
      </div>
      <div class="welcome-actions">
        <a class="btn btn-white" href="/app/teacher/assignments">${icon('plus', 15)} New assignment</a>
        <a class="btn btn-glass" href="/app/teacher/students">${icon('users', 15)} Students</a>
      </div>
    </div>

    <div class="stat-grid">
      ${statTile({ iconName: 'users', color: '#4F7DF3', value: String(data.totalStudents || 0), label: 'Students', note: 'Across active classes' })}
      ${statTile({ iconName: 'school', color: '#0E9F6E', value: String(data.totalClasses || 0), label: 'Classes', note: 'Your teaching groups' })}
      ${statTile({ iconName: 'assignment', color: '#F2994A', value: String(data.totalAssignments || 0), label: 'Assignments', note: 'Published in total' })}
      ${statTile({ iconName: 'clipboard', color: '#8367E8', value: String(data.pendingReviews || 0), label: 'Awaiting review', note: data.pendingReviews ? 'Needs your attention' : 'All caught up' })}
    </div>

    <div class="dash-layout teacher-layout">
      <div class="stack-lg">
        <section class="panel">
          <div class="panel-head">
            <div><h2>Your classes</h2><p>Students and assignments by class</p></div>
            <a class="link-arrow" href="/app/teacher/students">All students ${icon('arrow-right', 13)}</a>
          </div>
          <div class="panel-body">
            ${classes.length ? `<div class="teacher-class-grid">
              ${classes.map((item) => `<a class="teacher-class-card" href="/app/teacher/students?classId=${encodeURIComponent(item.id)}">
                ${iconTile('graduation', '#0E9F6E')}
                <div>
                  <strong>${esc(item.name)}</strong>
                  <span>${item.studentCount} student${item.studentCount === 1 ? '' : 's'} · ${item.assignmentCount} assignment${item.assignmentCount === 1 ? '' : 's'}</span>
                </div>
                <span class="teacher-class-arrow">${icon('arrow-right', 14)}</span>
              </a>`).join('')}
            </div>` : emptyState({ iconName: 'school', title: 'No classes yet', text: 'Classes will appear once they are published.' })}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Assignments</h2><p>Latest work across your classes</p></div>
            <a class="link-arrow" href="/app/teacher/assignments">Manage ${icon('arrow-right', 13)}</a>
          </div>
          <div class="panel-body ${assignments.length ? 'flush' : ''}">
            ${assignments.length ? `<div class="table-wrap">
              <table class="data-table teacher-table">
                <thead><tr><th>Assignment</th><th>Class</th><th>Due</th><th>Submitted</th><th>Reviews</th></tr></thead>
                <tbody>
                  ${assignments.slice(0, 6).map((item) => {
                    const due = dueInfo(item.dueDate);
                    return `<tr>
                      <td><a href="/app/teacher/assignments/${esc(item.id)}"><strong>${esc(item.title)}</strong></a><small>${esc(item.subjectName)}</small></td>
                      <td>${esc(item.className)}</td>
                      <td><span class="table-date ${due.tone === 'danger' ? 'text-danger' : ''}">${esc(due.text)}</span></td>
                      <td>${item.submittedCount}/${item.totalStudents}</td>
                      <td>${item.pendingReviews ? `<span class="badge amber">${item.pendingReviews} to review</span>` : '<span class="badge green">Done</span>'}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>` : emptyState({ iconName: 'assignment', title: 'No assignments yet', text: 'Create your first assignment to get students started.', action: '<a class="btn btn-primary btn-sm" href="/app/teacher/assignments">Create assignment</a>' })}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Recent submissions</h2><p>The newest work from your students</p></div>
          </div>
          <div class="panel-body ${submissions.length ? 'flush' : ''}">
            ${submissions.length ? `<div class="table-wrap">
              <table class="data-table teacher-table">
                <thead><tr><th>Student</th><th>Assignment</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  ${submissions.map((item) => `<tr>
                    <td><strong>${esc(item.studentName)}</strong></td>
                    <td>${esc(item.assignmentTitle)}</td>
                    <td>${esc(timeAgo(item.submittedAt))}</td>
                    <td>${statusBadge(item.status)}</td>
                    <td class="table-action"><a class="link-arrow" href="/app/teacher/assignments/${esc(item.assignmentId)}">${item.status === 'REVIEWED' ? 'View' : 'Review'} ${icon('arrow-right', 12)}</a></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>` : emptyState({ iconName: 'clipboard', title: 'No submissions yet', text: 'Student submissions will appear here as soon as they are sent.' })}
          </div>
        </section>
      </div>

      <aside class="side-stack">
        <section class="panel">
          <div class="panel-head"><div><h2>Needs review</h2><p>${data.pendingReviews || 0} submission${data.pendingReviews === 1 ? '' : 's'} waiting</p></div></div>
          <div class="panel-body">
            ${data.pendingReviews
              ? `<div class="alert-banner amber">${icon('clock', 17)}<div><strong>Students are waiting for feedback.</strong><br>Open an assignment and award marks to keep the loop moving.</div></div>
                 <a class="btn btn-primary btn-block btn-sm" style="margin-top:12px" href="/app/teacher/assignments">Review submissions ${icon('arrow-right', 13)}</a>`
              : `<div class="empty-state compact"><span class="icon-tile">${icon('check-circle', 24)}</span><h3>All caught up</h3><p>Every submission has been reviewed.</p></div>`}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Student watchlist</h2><p>Progress at a glance</p></div>
            <a class="link-arrow" href="/app/teacher/students">View all ${icon('arrow-right', 12)}</a>
          </div>
          <div class="panel-body">
            ${students.length ? `<div class="teacher-student-list">
              ${students.slice(0, 6).map((student) => `<a class="teacher-student-row" href="/app/teacher/students?classId=${encodeURIComponent(student.classId || '')}">
                <span class="avatar sm">${esc((student.fullName || 'S').split(/\s+/).map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase())}</span>
                <div><strong>${esc(student.fullName)}</strong><span>${esc(student.className || 'Student')} · ${student.completedTopics} topics</span></div>
                <span class="teacher-student-score">${Math.round(student.averageQuizPercentage || 0)}%</span>
              </a>`).join('')}
            </div>` : emptyState({ iconName: 'users', title: 'No students yet', text: 'Students will appear after they join a class.' })}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><div><h2>Quick tip</h2><p>Keep the class moving</p></div></div>
          <div class="panel-body">
            <div class="teacher-tip">${icon('lightbulb', 18)}<p>Short, focused assignments with clear instructions tend to get more responses. Add a due date and a friendly first instruction.</p></div>
            <p class="muted" style="font-size:10.5px;margin-top:12px">Today is ${esc(formatDate(new Date()))}.</p>
          </div>
        </section>
      </aside>
    </div>
  </div>`;
}
