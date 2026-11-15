import { api } from '../api.js';
import { icon } from '../icons.js';
import { esc } from '../ui.js';

export async function render(ctx) {
  const { data } = await api.get('/api/student/progress', { signal: ctx.signal });
  const o = data || {};
  return `<div class="page">
    <div class="page-head"><div><h1>Progress</h1><p>Your learning overview.</p></div></div>
    <div class="stat-grid">
      <div class="stat-tile"><strong>${o.completedTopics || 0}/${o.totalTopics || 0}</strong><span>Topics</span></div>
      <div class="stat-tile"><strong>${o.quizzesAttempted || 0}</strong><span>Quiz attempts</span></div>
      <div class="stat-tile"><strong>${Math.round(o.averageQuizPercentage || 0)}%</strong><span>Avg quiz</span></div>
      <div class="stat-tile"><strong>${o.streakDays || 0}</strong><span>Streak</span></div>
    </div>
  </div>`;
}