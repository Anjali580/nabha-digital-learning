import { api } from '../api.js';
import { icon } from '../icons.js';
import { esc } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get('/api/student/preferences', { signal: ctx.signal });
  const p = data || {};
  return `<div class="page">
    <div class="page-head"><div><h1>Settings</h1><p>Personalize your learning experience.</p></div></div>
    <div class="panel" style="padding:24px;max-width:560px">
      <form id="settings-form" class="stack-sm">
        <label>Language
          <select name="language">
            <option value="en" ${p.language === 'en' ? 'selected' : ''}>English</option>
            <option value="hi" ${p.language === 'hi' ? 'selected' : ''}>Hindi</option>
            <option value="pa" ${p.language === 'pa' ? 'selected' : ''}>Punjabi</option>
          </select>
        </label>
        <label>Theme
          <select name="theme">
            <option value="light" ${p.theme === 'light' ? 'selected' : ''}>Light</option>
            <option value="dark" ${p.theme === 'dark' ? 'selected' : ''}>Dark</option>
          </select>
        </label>
        <label>Daily goal (topics)
          <input type="number" name="dailyGoalTopics" min="1" max="10" value="${p.dailyGoalTopics || 2}">
        </label>
        <label class="row"><input type="checkbox" name="emailNotifications" ${p.emailNotifications ? 'checked' : ''}> Email notifications</label>
        <label class="row"><input type="checkbox" name="assignmentReminders" ${p.assignmentReminders ? 'checked' : ''}> Assignment reminders</label>
        <button class="btn btn-primary" type="submit">${icon('check', 14)} Save settings</button>
      </form>
    </div>
  </div>`;
}

export async function mount(ctx) {
  const root = ctx.root || document;
  root.querySelector('#settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      language: fd.get('language'),
      theme: fd.get('theme'),
      dailyGoalTopics: Number(fd.get('dailyGoalTopics')),
      emailNotifications: fd.get('emailNotifications') === 'on',
      assignmentReminders: fd.get('assignmentReminders') === 'on'
    };
    try {
      await api.put('/api/student/preferences', body, { signal: ctx.signal });
      alert('Settings saved.');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  });
}