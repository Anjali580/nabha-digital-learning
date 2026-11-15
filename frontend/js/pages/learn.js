import { api } from '../api.js';
import { auth } from '../auth.js';
import { continueCard, subjectCard } from '../components/cards.js';
import { icon } from '../icons.js';
import {
  emptyState, esc, formatDate, iconTile, progressBar, ring
} from '../ui.js';

export async function render(ctx) {
  const [progressResult, continueResult] = await Promise.allSettled([
    api.get('/api/student/progress/subjects', { signal: ctx.signal }),
    api.get('/api/student/continue-learning', { signal: ctx.signal })
  ]);
  if (progressResult.status === 'rejected' && progressResult.reason?.name === 'AbortError') return '';
  const subjects = progressResult.status === 'fulfilled' ? progressResult.value.data || [] : [];
  const continueItems = continueResult.status === 'fulfilled' ? continueResult.value.data || [] : [];
  const user = auth.getUser();
  const totalTopics = subjects.reduce((sum, subject) => sum + (subject.totalTopics || 0), 0);
  const completed = subjects.reduce((sum, subject) => sum + (subject.completedTopics || 0), 0);
  const percentage = totalTopics ? Math.round((completed / totalTopics) * 100) : 0;
  const started = subjects.filter((subject) => subject.completedTopics > 0);

  return `<div class="page">
    <div class="page-head">
      <div>
        <span class="eyebrow">Academic learning</span>
        <h1>Learn at your pace</h1>
        <p>${esc(user?.className || 'Your class')} · Five subjects, organised into chapters and short topics. Pick up wherever you left off.</p>
      </div>
      <div class="page-head-actions">
        <span class="date-chip">${icon('calendar', 14)} ${esc(formatDate(new Date()))}</span>
        <a class="btn btn-outline btn-sm" href="/app/quizzes">${icon('quiz', 15)} Quizzes</a>
      </div>
    </div>

    <section class="learn-summary">
      <div>
        <h2>${started.length ? 'Keep your rhythm going' : 'Start with one short topic'}</h2>
        <p>${started.length
          ? 'Your completed topics are saved automatically. There is no deadline on this page.'
          : 'Open any subject below. Most topics take 8–14 minutes to read and practise.'}</p>
        <div class="overview-bits">
          <div><strong>${completed}</strong><span>Topics completed</span></div>
          <div><strong>${totalTopics}</strong><span>Topics available</span></div>
          <div><strong>${subjects.length}</strong><span>Subjects</span></div>
          <div><strong>${started.length}</strong><span>Subjects started</span></div>
        </div>
      </div>
      ${ring(percentage, 'overall', 94)}
    </section>

    ${continueItems.length ? `<section class="panel" style="margin-bottom:22px">
      <div class="panel-head">
        <div><h2>Pick up where you left off</h2><p>Recently opened topics</p></div>
        <a class="link-arrow" href="/app/progress">View progress ${icon('arrow-right', 13)}</a>
      </div>
      <div class="panel-body"><div class="stack-sm">${continueItems.slice(0, 3).map(continueCard).join('')}</div></div>
    </section>` : ''}

    <div class="page-head" style="margin-bottom:14px">
      <div><h2 style="font-size:1.15rem">Your subjects</h2><p>Choose a subject to open its chapters.</p></div>
    </div>

    ${subjects.length ? `<div class="subject-card-grid">${subjects.map((subject) => subjectCard(subject)).join('')}</div>`
      : emptyState({
        iconName: 'book-open',
        title: 'No subjects available',
        text: 'Your class does not have published subjects yet. Please check back later or contact the project team.',
        action: '<a class="btn btn-outline btn-sm" href="/contact">Contact us</a>'
      })}

    <section class="panel" style="margin-top:22px">
      <div class="panel-head">
        <div><h2>How to get the most from a topic</h2><p>A simple routine that works</p></div>
      </div>
      <div class="panel-body">
        <div class="grid-3">
          <div class="row" style="align-items:flex-start">${iconTile('book-open', '#0E9F6E')}<div><strong style="font-size:12.5px;color:var(--ink)">Read once without stopping</strong><p style="font-size:11px;color:var(--muted);margin-top:3px;line-height:1.55">Get the whole idea before you try to memorise details.</p></div></div>
          <div class="row" style="align-items:flex-start">${iconTile('lightbulb', '#F2994A')}<div><strong style="font-size:12.5px;color:var(--ink)">Explain it aloud</strong><p style="font-size:11px;color:var(--muted);margin-top:3px;line-height:1.55">If you can explain it simply, you understand it.</p></div></div>
          <div class="row" style="align-items:flex-start">${iconTile('quiz', '#8367E8')}<div><strong style="font-size:12.5px;color:var(--ink)">Try the practice questions</strong><p style="font-size:11px;color:var(--muted);margin-top:3px;line-height:1.55">Answer first, then reveal the model answer.</p></div></div>
        </div>
      </div>
    </section>
  </div>`;
}
