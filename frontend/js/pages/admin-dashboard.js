import { api } from '../api.js';
import { auth } from '../auth.js';
import { icon } from '../icons.js';
import { avatar, esc, timeAgo } from '../ui.js';

function firstName(name) {
  return (name || 'Admin').split(/\s+/)[0];
}

function roleBadge(role) {
  const value = role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Teacher' : 'Student';
  const tone = role === 'ADMIN' ? 'blue' : role === 'TEACHER' ? 'violet' : 'green';
  return `<span class="badge ${tone}">${value}</span>`;
}

function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function splitRow(label, value, total, tone) {
  return `<div class="admin-split-row">
    <div class="admin-split-head">
      <span class="admin-split-label"><i class="admin-dot ${tone}"></i>${label}</span>
      <strong>${value}<small> / ${total}</small></strong>
    </div>
    <div class="mini-progress"><span style="width:${percent(value, total)}%"></span></div>
  </div>`;
}

export async function render(ctx) {
  const { data } = await api.get('/api/admin/dashboard', { signal: ctx.signal });
  const d = data || {};
  const me = auth.getUser() || {};
  const totalUsers = (d.totalStudents || 0) + (d.totalTeachers || 0) + (d.totalAdmins || 0);
  const classes = d.classes || [];
  const recent = d.recentUsers || [];

  return `<div class="page admin-page">
    <div class="page-head">
      <div>
        <span class="eyebrow">School administration</span>
        <h1>Hello, ${esc(firstName(me.fullName))}.</h1>
        <p>Everything happening across ${esc(me.schoolName || 'your school')} — people, classes and learning activity.</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-outline btn-sm" href="/app/admin/users">${icon('users', 16)} Manage people</a>
        <a class="btn btn-primary btn-sm" href="/app/teacher/dashboard">${icon('school', 16)} Teacher workspace</a>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-tile">
        <span class="icon-tile green">${icon('graduation', 18)}</span>
        <div><strong>${d.totalStudents || 0}</strong><span>Students</span><small>${d.activeStudents || 0} active</small></div>
      </div>
      <div class="stat-tile">
        <span class="icon-tile violet">${icon('users', 18)}</span>
        <div><strong>${d.totalTeachers || 0}</strong><span>Teachers</span><small>${d.activeTeachers || 0} active</small></div>
      </div>
      <div class="stat-tile">
        <span class="icon-tile blue">${icon('school', 18)}</span>
        <div><strong>${d.totalClasses || 0}</strong><span>Classes</span><small>${d.publishedAssignments || 0} assignments</small></div>
      </div>
      <div class="stat-tile">
        <span class="icon-tile amber">${icon('clipboard', 18)}</span>
        <div><strong>${d.pendingReviews || 0}</strong><span>Awaiting review</span><small>${d.totalSubmissions || 0} submissions</small></div>
      </div>
    </div>

    <div class="dash-layout">
      <div class="side-stack">
        <section class="panel">
          <div class="panel-head">
            <div><h2>Who is on NabhaLearn</h2><p>${totalUsers} account${totalUsers === 1 ? '' : 's'} across all roles</p></div>
            <a class="link-arrow" href="/app/admin/users">All people ${icon('arrow-right', 12)}</a>
          </div>
          <div class="panel-body">
            <div class="admin-split">
              ${splitRow('Students', d.totalStudents || 0, totalUsers, 'green')}
              ${splitRow('Teachers', d.totalTeachers || 0, totalUsers, 'violet')}
              ${splitRow('Administrators', d.totalAdmins || 0, totalUsers, 'blue')}
            </div>
            <div class="teacher-meta-grid" style="margin-top:16px">
              <div><span>Active students</span><strong>${d.activeStudents || 0}</strong></div>
              <div><span>Active teachers</span><strong>${d.activeTeachers || 0}</strong></div>
              <div><span>Active admins</span><strong>${d.activeAdmins || 0}</strong></div>
              <div><span>Total accounts</span><strong>${totalUsers}</strong></div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Classes</h2><p>Student and assignment load by class</p></div>
            <a class="link-arrow" href="/app/teacher/students">Roster ${icon('arrow-right', 12)}</a>
          </div>
          <div class="panel-body ${classes.length ? 'flush' : ''}">
            ${classes.length ? `<div class="admin-class-list">
              ${classes.map((item) => `<div class="admin-class-row">
                <span class="icon-tile sm">${icon('school', 16)}</span>
                <div class="admin-class-copy">
                  <strong>${esc(item.name)}</strong>
                  <span>${item.students} student${item.students === 1 ? '' : 's'} · ${item.assignments} assignment${item.assignments === 1 ? '' : 's'}</span>
                </div>
                <span class="badge">Level ${esc(item.level)}</span>
              </div>`).join('')}
            </div>` : `<div class="panel-body"><p class="muted">Classes will appear here once they are created.</p></div>`}
          </div>
        </section>
      </div>

      <aside class="side-stack">
        <section class="panel">
          <div class="panel-head">
            <div><h2>Recent sign-ups</h2><p>The newest accounts on the platform</p></div>
          </div>
          <div class="panel-body ${recent.length ? 'flush' : ''}">
            ${recent.length ? `<div class="admin-people">
              ${recent.map((person) => `<div class="admin-person-row">
                ${avatar({ fullName: person.fullName }, 'sm')}
                <div class="admin-person-copy">
                  <strong>${esc(person.fullName)}</strong>
                  <span>${esc(person.email)}</span>
                </div>
                <div class="admin-person-meta">
                  ${roleBadge(person.role)}
                  <small>${person.createdAt ? esc(timeAgo(person.createdAt)) : 'New'}</small>
                </div>
              </div>`).join('')}
            </div>` : `<p class="muted">No sign-ups yet.</p>`}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Platform content</h2><p>What students can explore today</p></div>
          </div>
          <div class="panel-body">
            <div class="teacher-meta-grid">
              <div><span>Subjects</span><strong>${d.totalSubjects || 0}</strong></div>
              <div><span>Topics</span><strong>${d.totalTopics || 0}</strong></div>
              <div><span>Quizzes</span><strong>${d.totalQuizzes || 0}</strong></div>
              <div><span>Submissions</span><strong>${d.totalSubmissions || 0}</strong></div>
            </div>
          </div>
        </section>

        ${d.pendingReviews > 0 ? `<section class="panel">
          <div class="panel-body">
            <div class="teacher-tip">
              ${icon('clock', 16)}
              <p><strong>${d.pendingReviews} submission${d.pendingReviews === 1 ? '' : 's'} need review.</strong>
                Open the teacher workspace to award marks and keep feedback moving.</p>
            </div>
            <a class="btn btn-primary btn-sm btn-block" style="margin-top:12px" href="/app/teacher/assignments">
              ${icon('assignment', 15)} Go to reviews
            </a>
          </div>
        </section>` : ''}
      </aside>
    </div>
  </div>`;
}
