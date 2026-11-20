import { api } from '../api.js';
import { auth, updateUser } from '../auth.js';
import { icon } from '../icons.js';
import {
  avatar, esc, setBusy, showFieldErrors, toast
} from '../ui.js';

function isTeacher(user) {
  return user?.role === 'TEACHER' || user?.role === 'ADMIN';
}

export async function render(ctx) {
  const me = auth.getUser();
  const teacher = isTeacher(me);
  const base = teacher ? '/api/teacher' : '/api/student';
  const [{ data }, { data: classes }] = await Promise.all([
    api.get(`${base}/profile`, { signal: ctx.signal }),
    teacher ? Promise.resolve({ data: [] }) : api.get('/api/classes', { signal: ctx.signal })
  ]);
  const user = data?.user || {};
  const prefs = data?.preferences || {};
  const staff = isTeacher(user) || teacher;
  const effectiveRole = user.role || me?.role || 'STUDENT';
  const teacherOnly = effectiveRole === 'TEACHER';
  const adminRole = effectiveRole === 'ADMIN';
  const languageNames = { en: 'English', hi: 'Hindi', pa: 'Punjabi' };
  const language = languageNames[user.preferredLanguage] || 'English';
  const role = effectiveRole === 'ADMIN' ? 'Administrator'
    : effectiveRole === 'TEACHER' ? 'Teacher' : 'Student';
  const dailyGoal = prefs.dailyGoalTopics || 2;
  const classList = classes || [];

  return `<div class="page profile-page">
    <div class="page-head">
      <div>
        <h1>Your profile</h1>
        <p>${adminRole
          ? 'Manage your photo, administrator account and school settings.'
          : staff
            ? 'Manage your photo, teaching details and workspace preferences.'
            : 'Manage your photo, account details and learning preferences.'}</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-outline btn-sm" href="/app/settings">${icon('settings', 16)} Settings</a>
      </div>
    </div>

    <div class="profile-layout">
      <aside class="profile-card">
        <div class="avatar-upload">
          ${avatar(user)}
          <label class="avatar-edit" title="Change profile photo">
            ${icon('camera', 14)}
            <span class="sr-only">Change profile photo</span>
            <input type="file" id="avatar-input" accept="image/*" hidden>
          </label>
        </div>
        <h2>${esc(user.fullName || (adminRole ? 'Administrator' : staff ? 'Teacher' : 'Student'))}</h2>
        <p>${esc(user.email || '')}</p>
        <div class="profile-badges">
          <span class="badge ${adminRole ? 'blue' : staff ? 'violet' : 'green'}">${esc(role)}</span>
          ${!staff && user.className ? `<span class="badge">${esc(user.className)}</span>` : ''}
          ${teacherOnly && user.degree ? `<span class="badge blue">${esc(user.degree)}</span>` : ''}
          ${user.demo ? '<span class="badge amber">Demo account</span>' : ''}
        </div>
        <div class="profile-meta">
          <div class="profile-meta-row"><span>School</span><strong>${esc(user.schoolName || 'Not set')}</strong></div>
          ${teacherOnly
            ? `<div class="profile-meta-row"><span>Qualification</span><strong>${esc(user.degree || 'Not set')}</strong></div>`
            : ''}
          <div class="profile-meta-row"><span>Language</span><strong>${esc(language)}</strong></div>
          ${staff
            ? `<div class="profile-meta-row"><span>Role</span><strong>${esc(role)}</strong></div>`
            : `<div class="profile-meta-row"><span>Daily goal</span><strong>${dailyGoal} topic${dailyGoal === 1 ? '' : 's'}</strong></div>`}
        </div>
      </aside>

      <div class="stack-md">
        <section class="panel">
          <div class="panel-head">
            <div class="row">
              <span class="icon-tile sm">${icon('user', 18)}</span>
              <div><h2>Account details</h2><p>Keep your personal information up to date.</p></div>
            </div>
          </div>
          <div class="panel-body">
            <form id="profile-form" novalidate>
              <div class="form-grid">
                <div class="field">
                  <label for="profile-name">Full name</label>
                  <input class="input" id="profile-name" name="fullName" value="${esc(user.fullName || '')}" required>
                </div>
                <div class="field">
                  <label for="profile-email">Email address</label>
                  <input class="input" id="profile-email" name="email" type="email" value="${esc(user.email || '')}" required>
                </div>
                ${teacherOnly ? `<div class="field">
                  <label for="profile-degree">Teaching degree</label>
                  <input class="input" id="profile-degree" name="degree" value="${esc(user.degree || '')}" maxlength="120" required placeholder="e.g. B.Ed., M.Sc.">
                  <span class="hint">Shown on your teacher profile.</span>
                </div>` : ''}
                ${!staff ? `<div class="field">
                  <label for="profile-class">Class</label>
                  <select class="select" id="profile-class" name="classId" required>
                    <option value="">Choose class</option>
                    ${classList.map((item) => `<option value="${esc(item.id)}" ${item.id === user.classId ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}
                  </select>
                </div>` : ''}
                <div class="field">
                  <label for="profile-language">Preferred language</label>
                  <select class="select" id="profile-language" name="preferredLanguage">
                    <option value="en" ${user.preferredLanguage === 'en' ? 'selected' : ''}>English</option>
                    <option value="hi" ${user.preferredLanguage === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                    <option value="pa" ${user.preferredLanguage === 'pa' ? 'selected' : ''}>ਪੰਜਾਬੀ (Punjabi)</option>
                  </select>
                </div>
                <div class="field span-2">
                  <label for="profile-school">School name <span class="optional">(optional)</span></label>
                  <input class="input" id="profile-school" name="schoolName" value="${esc(user.schoolName || '')}" placeholder="Your school or village school">
                </div>
                <div class="field span-2">
                  <label for="profile-current-password">Current password <span class="optional">(required to change email)</span></label>
                  <input class="input" id="profile-current-password" name="currentPassword" type="password" autocomplete="current-password" placeholder="Enter your current password">
                  <span class="hint">Leave this blank if you are not changing your email address.</span>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn btn-primary" type="submit">${icon('check', 16)} Save changes</button>
              </div>
            </form>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div class="row">
              <span class="icon-tile sm">${icon('settings', 18)}</span>
              <div><h2>${adminRole ? 'Administrator preferences' : staff ? 'Workspace preferences' : 'Learning preferences'}</h2><p>${adminRole
                ? 'Choose how your admin workspace looks and keeps you informed.'
                : staff
                  ? 'Choose how your teacher workspace looks and notifies you.'
                  : 'Shape your daily learning experience.'}</p></div>
            </div>
          </div>
          <div class="panel-body">
            <form id="prefs-form" novalidate>
              <div class="form-grid">
                <div class="field">
                  <label for="prefs-theme">Theme</label>
                  <select class="select" id="prefs-theme" name="theme">
                    <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Light</option>
                    <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Dark</option>
                  </select>
                </div>
                ${staff
                  ? `<input type="hidden" name="dailyGoalTopics" value="${dailyGoal}">`
                  : `<div class="field">
                    <label for="prefs-goal">Daily goal</label>
                    <input class="input" id="prefs-goal" type="number" name="dailyGoalTopics" min="1" max="10" value="${dailyGoal}">
                    <span class="hint">Topics you aim to finish each day (1–10).</span>
                  </div>`}
              </div>
              <div class="switch-row">
                <div><strong>Email notifications</strong><p>${adminRole
                  ? 'Get school-wide updates and account emails.'
                  : staff
                    ? 'Get updates about submissions and workspace activity.'
                    : 'Get learning updates and account emails.'}</p></div>
                <label class="switch">
                  <input type="checkbox" name="emailNotifications" aria-label="Email notifications" ${prefs.emailNotifications ? 'checked' : ''}>
                  <span></span>
                </label>
              </div>
              <div class="switch-row">
                <div><strong>${adminRole ? 'Account activity reminders' : staff ? 'Review reminders' : 'Assignment reminders'}</strong><p>${adminRole
                  ? 'Get a nudge when accounts are created or need attention.'
                  : staff
                    ? 'Receive a nudge when submissions are waiting for review.'
                    : 'Receive a nudge before assignments are due.'}</p></div>
                <label class="switch">
                  <input type="checkbox" name="assignmentReminders" aria-label="${adminRole ? 'Account activity reminders' : staff ? 'Review reminders' : 'Assignment reminders'}" ${prefs.assignmentReminders ? 'checked' : ''}>
                  <span></span>
                </label>
              </div>
              <div class="form-actions">
                <button class="btn btn-primary" type="submit">${icon('check', 16)} Save preferences</button>
              </div>
            </form>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div class="row">
              <span class="icon-tile sm">${icon('lock', 18)}</span>
              <div><h2>Security</h2><p>Update the password you use to sign in.</p></div>
            </div>
          </div>
          <div class="panel-body">
            <form id="password-form" novalidate>
              <div class="form-grid">
                <div class="field span-2">
                  <label for="password-current">Current password</label>
                  <input class="input" id="password-current" name="currentPassword" type="password" autocomplete="current-password" required>
                </div>
                <div class="field">
                  <label for="password-new">New password</label>
                  <input class="input" id="password-new" name="newPassword" type="password" autocomplete="new-password" required minlength="8">
                  <span class="hint">At least 8 characters with a letter and a number.</span>
                </div>
                <div class="field">
                  <label for="password-confirm">Confirm new password</label>
                  <input class="input" id="password-confirm" name="confirmPassword" type="password" autocomplete="new-password" required minlength="8">
                </div>
              </div>
              <div class="form-actions">
                <button class="btn btn-outline" type="submit">${icon('lock', 16)} Update password</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  </div>`;
}

export async function mount(ctx) {
  const root = ctx.root || document;
  const me = auth.getUser();
  const staff = isTeacher(me);
  const teacherOnly = me?.role === 'TEACHER';
  const adminRole = me?.role === 'ADMIN';
  const base = staff ? '/api/teacher' : '/api/student';

  root.querySelector('#avatar-input')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.upload(`${base}/avatar`, formData, { signal: ctx.signal });
      if (data) updateUser(data);
      toast('Profile photo updated.', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      toast(error.errors ? Object.values(error.errors).join(' ') : error.message, 'error');
    }
  });

  root.querySelector('#profile-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const body = {
      fullName: String(data.get('fullName') || '').trim(),
      email: String(data.get('email') || '').trim(),
      schoolName: String(data.get('schoolName') || '').trim() || null,
      preferredLanguage: data.get('preferredLanguage') || 'en',
      currentPassword: data.get('currentPassword') || null
    };
    if (teacherOnly) {
      body.degree = String(data.get('degree') || '').trim();
      body.classId = null;
    } else if (adminRole) {
      body.classId = null;
    } else {
      body.classId = data.get('classId');
    }
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, 'Saving…');
    try {
      const { data: updated } = await api.put(`${base}/profile`, body, { signal: ctx.signal });
      if (updated?.user) updateUser(updated.user);
      toast('Profile updated.', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setBusy(button, false);
      if (error.errors) showFieldErrors(form, error.errors, error.message);
      else toast(error.message || 'Could not update your profile.', 'error');
    }
  });

  root.querySelector('#prefs-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const body = {
      theme: data.get('theme'),
      dailyGoalTopics: Number(data.get('dailyGoalTopics') || 2),
      emailNotifications: data.get('emailNotifications') === 'on',
      assignmentReminders: data.get('assignmentReminders') === 'on'
    };
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, 'Saving…');
    try {
      await api.put(`${base}/preferences`, body, { signal: ctx.signal });
      toast('Preferences saved.', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setBusy(button, false);
      if (error.errors) showFieldErrors(form, error.errors, error.message);
      else toast(error.message || 'Could not save preferences.', 'error');
    }
  });

  root.querySelector('#password-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const body = {
      currentPassword: data.get('currentPassword'),
      newPassword: data.get('newPassword'),
      confirmPassword: data.get('confirmPassword')
    };
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, 'Updating…');
    try {
      await api.put(`${base}/password`, body, { signal: ctx.signal });
      setBusy(button, false);
      toast('Password updated.', 'success');
      form.reset();
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setBusy(button, false);
      if (error.errors) showFieldErrors(form, error.errors, error.message);
      else toast(error.message || 'Could not update your password.', 'error');
    }
  });
}
