import { api } from '../api.js';
import { auth, updateUser } from '../auth.js';
import { icon } from '../icons.js';
import { avatar, esc } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get('/api/student/profile', { signal: ctx.signal });
  const user = data?.user || {};
  const prefs = data?.preferences || {};
  return `<div class="page profile-page">
    <div class="profile-bg" aria-hidden="true">
      <span>📚</span><span>🔬</span><span>📐</span><span>🌍</span><span>🧮</span><span>🎨</span>
    </div>
    <div class="page-head">
      <div><h1>Your profile</h1><p>Manage your account, photo and preferences.</p></div>
    </div>
    <div class="profile-hero panel">
      <div class="profile-avatar-wrap">
        ${user.avatarUrl ? `<img src="${esc(user.avatarUrl)}" alt="Avatar" class="profile-avatar">` : avatar(user, 'profile-avatar-lg')}
        <label class="btn btn-soft btn-sm profile-upload">
          ${icon('camera', 14)} Change photo
          <input type="file" id="avatar-input" accept="image/*" hidden>
        </label>
      </div>
      <div class="profile-meta">
        <h2>${esc(user.fullName || '')}</h2>
        <p>${esc(user.email || '')}</p>
        <div class="profile-badges">
          <span class="badge green">${esc(user.role || 'Student')}</span>
          <span class="badge">${esc(user.className || '')}</span>
          ${user.demo ? '<span class="badge">Demo account</span>' : ''}
        </div>
      </div>
    </div>

    <div class="profile-grid">
      <section class="panel">
        <div class="panel-head"><div><h2>Account details</h2><p>Keep your information up to date</p></div></div>
        <div class="panel-body">
          <form id="profile-form" class="stack-sm">
            <input type="hidden" name="email" value="${esc(user.email || '')}">
            <input type="hidden" name="classId" value="${esc(user.classId || '')}">
            <label>Full name
              <input name="fullName" value="${esc(user.fullName || '')}" required>
            </label>
            <label>Email
              <input name="email" value="${esc(user.email || '')}" required>
            </label>
            <label>School name
              <input name="schoolName" value="${esc(user.schoolName || '')}">
            </label>
            <label>Preferred language
              <select name="preferredLanguage">
                <option value="en" ${user.preferredLanguage === 'en' ? 'selected' : ''}>English</option>
                <option value="hi" ${user.preferredLanguage === 'hi' ? 'selected' : ''}>Hindi</option>
                <option value="pa" ${user.preferredLanguage === 'pa' ? 'selected' : ''}>Punjabi</option>
              </select>
            </label>
            <button class="btn btn-primary" type="submit">${icon('check', 14)} Save changes</button>
          </form>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><h2>Learning preferences</h2><p>Shape your daily experience</p></div></div>
        <div class="panel-body">
          <form id="prefs-form" class="stack-sm">
            <label>Theme
              <select name="theme">
                <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Light</option>
                <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Dark</option>
              </select>
            </label>
            <label>Daily goal (topics)
              <input type="number" name="dailyGoalTopics" min="1" max="10" value="${prefs.dailyGoalTopics || 2}">
            </label>
            <label class="row"><input type="checkbox" name="emailNotifications" ${prefs.emailNotifications ? 'checked' : ''}> Email notifications</label>
            <label class="row"><input type="checkbox" name="assignmentReminders" ${prefs.assignmentReminders ? 'checked' : ''}> Assignment reminders</label>
            <button class="btn btn-primary" type="submit">${icon('check', 14)} Save preferences</button>
          </form>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><h2>Security</h2><p>Change your password</p></div></div>
        <div class="panel-body">
          <form id="password-form" class="stack-sm">
            <label>Current password
              <input type="password" name="currentPassword" required>
            </label>
            <label>New password
              <input type="password" name="newPassword" required minlength="8">
            </label>
            <button class="btn btn-outline" type="submit">${icon('lock', 14)} Update password</button>
          </form>
        </div>
      </section>
    </div>
  </div>`;
}

export async function mount(ctx) {
  const root = ctx.root || document;

  root.querySelector('#avatar-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.upload('/api/student/avatar', fd, { signal: ctx.signal });
      if (data) updateUser(data);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  });

  root.querySelector('#profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      fullName: fd.get('fullName'),
      email: fd.get('email'),
      classId: fd.get('classId'),
      schoolName: fd.get('schoolName'),
      preferredLanguage: fd.get('preferredLanguage')
    };
    try {
      await api.put('/api/student/profile', body, { signal: ctx.signal });
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  });

  root.querySelector('#prefs-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      theme: fd.get('theme'),
      dailyGoalTopics: Number(fd.get('dailyGoalTopics')),
      emailNotifications: fd.get('emailNotifications') === 'on',
      assignmentReminders: fd.get('assignmentReminders') === 'on'
    };
    try {
      await api.put('/api/student/preferences', body, { signal: ctx.signal });
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  });

  root.querySelector('#password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      currentPassword: fd.get('currentPassword'),
      newPassword: fd.get('newPassword')
    };
    try {
      await api.put('/api/student/password', body, { signal: ctx.signal });
      alert('Password updated.');
      e.target.reset();
    } catch (err) {
      alert(err.message);
    }
  });
}