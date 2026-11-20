import { api } from '../api.js';
import { auth } from '../auth.js';
import { icon } from '../icons.js';
import { esc, setBusy, toast } from '../ui.js';

function isTeacher(user) {
  return user?.role === 'TEACHER' || user?.role === 'ADMIN';
}

export async function render(ctx) {
  const me = auth.getUser();
  const teacher = isTeacher(me);
  const adminRole = me?.role === 'ADMIN';
  const base = teacher ? '/api/teacher' : '/api/student';
  const { data } = await api.get(`${base}/preferences`, { signal: ctx.signal });
  const p = data || {};

  return `<div class="page settings-page">
    <div class="page-head">
      <div>
        <h1>Settings</h1>
        <p>${adminRole
          ? 'Personalise your admin workspace and school-wide notifications.'
          : teacher
            ? 'Personalise your teacher workspace and notification preferences.'
            : 'Personalise your learning experience and notifications.'}</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-outline btn-sm" href="/app/profile">${icon('user', 16)} Profile</a>
      </div>
    </div>

    <div class="settings-layout">
      <form id="settings-form" class="stack-md" novalidate>
        <section class="panel">
          <div class="panel-head">
            <div class="row">
              <span class="icon-tile sm">${icon('globe', 18)}</span>
              <div><h2>Language &amp; appearance</h2><p>Choose the language and theme you prefer.</p></div>
            </div>
          </div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="field">
                <label for="settings-language">Language</label>
                <select class="select" id="settings-language" name="language">
                  <option value="en" ${p.language === 'en' ? 'selected' : ''}>English</option>
                  <option value="hi" ${p.language === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                  <option value="pa" ${p.language === 'pa' ? 'selected' : ''}>ਪੰਜਾਬੀ (Punjabi)</option>
                </select>
              </div>
              <div class="field">
                <label for="settings-theme">Theme</label>
                <select class="select" id="settings-theme" name="theme">
                  <option value="light" ${p.theme === 'light' ? 'selected' : ''}>Light</option>
                  <option value="dark" ${p.theme === 'dark' ? 'selected' : ''}>Dark</option>
                </select>
              </div>
              ${teacher
                ? `<input type="hidden" name="dailyGoalTopics" value="${p.dailyGoalTopics || 2}">`
                : `<div class="field">
                  <label for="settings-goal">Daily goal (topics)</label>
                  <input class="input" id="settings-goal" type="number" name="dailyGoalTopics" min="1" max="10" value="${p.dailyGoalTopics || 2}">
                  <span class="hint">Topics you aim to finish each day (1–10).</span>
                </div>`}
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div class="row">
              <span class="icon-tile sm">${icon('bell', 18)}</span>
              <div><h2>Notifications</h2><p>Decide what you want to be reminded about.</p></div>
            </div>
          </div>
          <div class="panel-body">
            <div class="switch-row">
              <div><strong>Email notifications</strong><p>${adminRole
                ? 'Receive school-wide updates and account emails.'
                : teacher
                  ? 'Receive updates about your workspace and student activity.'
                  : 'Receive learning updates and account emails.'}</p></div>
              <label class="switch">
                <input type="checkbox" name="emailNotifications" aria-label="Email notifications" ${p.emailNotifications ? 'checked' : ''}>
                <span></span>
              </label>
            </div>
            <div class="switch-row">
              <div><strong>${adminRole ? 'Account activity reminders' : teacher ? 'Review reminders' : 'Assignment reminders'}</strong><p>${adminRole
                ? 'Get a nudge when accounts are created or need attention.'
                : teacher
                  ? 'Get a nudge when submissions are waiting for review.'
                  : 'Receive a nudge before assignments are due.'}</p></div>
              <label class="switch">
                <input type="checkbox" name="assignmentReminders" aria-label="${adminRole ? 'Account activity reminders' : teacher ? 'Review reminders' : 'Assignment reminders'}" ${p.assignmentReminders ? 'checked' : ''}>
                <span></span>
              </label>
            </div>
          </div>
        </section>

        <div class="settings-actions">
          <button class="btn btn-primary" type="submit">${icon('check', 16)} Save settings</button>
        </div>
      </form>

      <aside class="stack-md">
        <section class="panel settings-side">
          <div class="panel-body">
            <span class="icon-tile">${icon('shield', 20)}</span>
            <h3>Account &amp; security</h3>
            <p>Update your name, photo, email or password on your profile page.</p>
            <a class="btn btn-outline btn-sm btn-block" href="/app/profile">${icon('user', 15)} Open profile</a>
          </div>
        </section>
        <section class="panel settings-side">
          <div class="panel-body">
            <span class="icon-tile">${icon('sparkles', 20)}</span>
            <h3>${adminRole ? 'Admin workspace' : teacher ? 'Teacher workspace' : 'Learning tips'}</h3>
            <p>${adminRole
              ? 'Keep an eye on new accounts and class activity. Open the teacher workspace any time to see assignments and reviews.'
              : teacher
                ? 'A short, clear assignment with a due date gets more responses. Review submissions regularly so students keep momentum.'
                : 'Short sessions work best. Finish one topic, take the quiz, then come back tomorrow — your streak will build itself.'}</p>
          </div>
        </section>
      </aside>
    </div>
  </div>`;
}

export async function mount(ctx) {
  const root = ctx.root || document;
  const teacher = isTeacher(auth.getUser());
  const base = teacher ? '/api/teacher' : '/api/student';
  const form = root.querySelector('#settings-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const body = {
      language: data.get('language'),
      theme: data.get('theme'),
      dailyGoalTopics: Number(data.get('dailyGoalTopics') || 2),
      emailNotifications: data.get('emailNotifications') === 'on',
      assignmentReminders: data.get('assignmentReminders') === 'on'
    };
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, 'Saving…');
    try {
      await api.put(`${base}/preferences`, body, { signal: ctx.signal });
      setBusy(button, false);
      toast('Settings saved.', 'success');
      if (body.theme) {
        document.documentElement.dataset.theme = body.theme;
        try { localStorage.setItem('nl-theme', body.theme); } catch { /* ignore */ }
      }
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setBusy(button, false);
      toast(error.errors ? Object.values(error.errors).join(' ') : (error.message || 'Could not save settings.'), 'error');
    }
  }, { signal: ctx.signal });
}
