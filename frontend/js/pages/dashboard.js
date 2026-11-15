import { api } from '../api.js';
import { auth } from '../auth.js';
import { assignmentCard, continueCard, statTile } from '../components/cards.js';
import { setShellStats } from '../components/layout.js';
import { icon } from '../icons.js';
import {
  emptyState, esc, firstName, formatDate, greeting, iconTile, pct, progressBar, ring,
  timeAgo, todayLabel
} from '../ui.js';

function activityIcon(item) {
  return iconTile(item.icon || (item.type === 'TOPIC_COMPLETED' ? 'check' : 'book'), item.color || '#0E9F6E');
}

function miniCalendar(items) {
  const activeDays = new Set();
  items.forEach((item) => {
    if (!item.occurredAt) return;
    activeDays.add(new Date(item.occurredAt).toDateString());
  });
  const days = [];
  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const active = activeDays.has(date.toDateString());
    const today = offset === 0;
    days.push(`<span class="cal-day ${active ? 'done' : ''} ${today ? 'today' : ''}" title="${esc(formatDate(date))}">${date.getDate()}</span>`);
  }
  return `<div class="mini-calendar">${days.join('')}</div>`;
}

export async function render(ctx) {
  const { data } = await api.get('/api/student/dashboard', { signal: ctx.signal });
  const user = auth.getUser();
  const overview = data.overview || {};
  const subjects = data.subjects || [];
  const continueItems = data.continueLearning || [];
  const recommended = data.recommended || [];
  const activity = data.recentActivity || [];
  const name = data.firstName || firstName(user?.fullName);
  const hasProgress = (overview.completedTopics || 0) > 0 || (overview.quizzesAttempted || 0) > 0;
  const goal = overview.dailyGoalTopics || 2;
  const today = overview.todayCompletedTopics || 0;
  const goalPct = pct(today, goal);

  setShellStats({
    unread: data.unreadNotifications || 0,
    dailyGoal: goal,
    todayCompleted: today,
    pending: overview.assignmentsPending || 0
  });

  return `<div class="page">
    <div class="welcome-banner">
      <div>
        <span class="welcome-tag">${icon('sun', 12)} ${esc(todayLabel())}</span>
        <h1 style="margin-top:9px">${esc(greeting())}, ${esc(name)}.</h1>
        <p>${hasProgress
          ? 'Continue where you left off, or choose a new topic for today.'
          : 'Your progress starts at zero. Open one topic and take your first small step.'}</p>
        <div class="row">
          <span class="welcome-tag">${icon('graduation', 12)} ${esc(data.className || 'Your class')}</span>
          ${user?.demo ? `<span class="welcome-tag">${icon('info', 12)} Demo account</span>` : ''}
          <span class="welcome-tag">${icon('flame', 12)} ${overview.streakDays || 0} day streak</span>
        </div>
      </div>
      <div class="welcome-actions">
        <a class="btn btn-white" href="${continueItems.length ? `/app/learn/topics/${esc(continueItems[0].topicId)}` : '/app/learn'}">
          ${continueItems.length ? 'Continue learning' : 'Start learning'} ${icon('arrow-right', 15)}
        </a>
        <a class="btn btn-glass" href="/app/explore">${icon('compass', 15)} Explore</a>
      </div>
    </div>

    <div class="dash-layout">
      <div class="stack-lg">
        <section class="hero-progress">
          ${ring(overview.percentage || 0, 'complete', 132)}
          <div class="hero-progress-copy">
            <h2>${hasProgress ? 'You are making progress' : 'Your learning journey starts here'}</h2>
            <p>${overview.completedTopics || 0} of ${overview.totalTopics || 0} topics completed across your subjects.</p>
            <div class="overall-stats">
              <div class="overall-stat"><strong>${overview.completedTopics || 0}</strong><span>${icon('check-circle', 12)} Topics done</span></div>
              <div class="overall-stat"><strong>${overview.quizzesAttempted || 0}</strong><span>${icon('quiz', 12)} Quiz attempts</span></div>
              <div class="overall-stat"><strong>${overview.streakDays || 0}</strong><span>${icon('flame', 12)} Day streak</span></div>
            </div>
            <div class="daily-goal">
              <div class="row"><span>Today’s goal</span><span>${today}/${goal} topics</span></div>
              ${progressBar(goalPct)}
            </div>
          </div>
        </section>

        <div class="stat-grid">
          ${statTile({ iconName: 'book-open', color: '#0E9F6E', value: `${overview.completedTopics || 0}/${overview.totalTopics || 0}`, label: 'Topics completed' })}
          ${statTile({ iconName: 'quiz', color: '#8367E8', value: overview.quizzesAttempted ? `${Math.round(overview.averageQuizPercentage || 0)}%` : '—', label: 'Average quiz score', note: overview.quizzesAttempted ? `${overview.quizzesAttempted} attempt${overview.quizzesAttempted === 1 ? '' : 's'}` : 'No attempts yet' })}
          ${statTile({ iconName: 'assignment', color: '#F2994A', value: String(overview.assignmentsPending || 0), label: 'Assignments pending', note: `${overview.assignmentsCompleted || 0} submitted` })}
          ${statTile({ iconName: 'bookmark', color: '#4F7DF3', value: String(overview.bookmarks || 0), label: 'Saved bookmarks' })}
        </div>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Your subjects</h2><p>Open a subject to see chapters and topics</p></div>
            <a class="link-arrow" href="/app/learn">All subjects ${icon('arrow-right', 13)}</a>
          </div>
          <div class="panel-body">
            ${subjects.length ? `<div class="subject-grid">
              ${subjects.map((subject) => `<a class="subject-tile" href="/app/learn/subjects/${esc(subject.id)}">
                <div class="subject-top">
                  ${iconTile(subject.icon || 'book', subject.color)}
                  <div><h3>${esc(subject.name)}</h3><p>${subject.chapterCount} chapters · ${subject.totalTopics} topics</p></div>
                </div>
                <div class="progress-track"><span style="width:${subject.percentage || 0}%"></span></div>
                <div class="subject-meta">
                  <span>${subject.completedTopics}/${subject.totalTopics} completed</span>
                  <span class="subject-arrow">${icon('arrow-right', 12)}</span>
                </div>
              </a>`).join('')}
            </div>` : emptyState({ iconName: 'book-open', title: 'No subjects yet', text: 'Your class subjects will appear here once they are published.' })}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Continue learning</h2><p>Topics you opened recently</p></div>
            <a class="link-arrow" href="/app/learn">Choose a topic ${icon('arrow-right', 13)}</a>
          </div>
          <div class="panel-body">
            ${continueItems.length
              ? `<div class="stack-sm">${continueItems.slice(0, 4).map(continueCard).join('')}</div>`
              : emptyState({
                iconName: 'play',
                title: hasProgress ? 'Everything opened is complete' : 'Nothing opened yet',
                text: hasProgress
                  ? 'Pick the next topic in any subject to keep going.'
                  : 'Open your first topic and it will appear here, ready whenever you return.',
                action: `<a class="btn btn-primary btn-sm" href="/app/learn">Open a subject ${icon('arrow-right', 13)}</a>`
              })}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Recent activity</h2><p>Your own learning history</p></div>
            <a class="link-arrow" href="/app/progress">Full progress ${icon('arrow-right', 13)}</a>
          </div>
          <div class="panel-body">
            ${activity.length ? `<div class="activity-list">
              ${activity.map((item) => `<a class="activity-item" href="${esc(item.link || '#')}">
                ${activityIcon(item)}
                <div style="min-width:0"><strong>${esc(item.title)}</strong><span>${esc(item.subtitle || '')}</span></div>
                <time>${esc(timeAgo(item.occurredAt))}</time>
              </a>`).join('')}
            </div>` : emptyState({
              iconName: 'chart',
              title: 'No activity yet',
              text: 'Complete a topic or take a quiz, and your history will start here.'
            })}
          </div>
        </section>
      </div>

      <aside class="side-stack">
        <section class="panel">
          <div class="panel-head">
            <div><h2>Recommended for you</h2><p>Based on your progress</p></div>
          </div>
          <div class="panel-body">
            ${recommended.length ? `<div class="recommend-list">
              ${recommended.map((item) => `<a class="recommend-card" href="${esc(item.link)}">
                ${iconTile(item.icon || (item.type === 'EXPLORE' ? 'sparkles' : 'book'), item.color)}
                <div style="min-width:0">
                  <strong>${esc(item.title)}</strong>
                  <span>${esc(item.subtitle || '')}</span>
                  <span class="rec-reason">${icon(item.type === 'EXPLORE' ? 'compass' : 'arrow-right', 10)} ${esc(item.reason || '')}</span>
                </div>
              </a>`).join('')}
            </div>` : emptyState({ iconName: 'sparkles', title: 'Recommendations will appear', text: 'As you complete topics, we will suggest what to do next.' })}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Study rhythm</h2><p>Last 14 days</p></div>
          </div>
          <div class="panel-body">
            ${miniCalendar(activity)}
            <div class="row between" style="margin-top:13px;font-size:10px;color:var(--muted)">
              <span>${icon('flame', 11)} ${overview.streakDays || 0} day streak</span>
              <span>${overview.todayCompletedTopics || 0}/${goal} today</span>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><h2>Notifications</h2><p>${data.unreadNotifications || 0} unread</p></div>
            <a class="link-arrow" href="/app/notifications">Open ${icon('arrow-right', 12)}</a>
          </div>
          <div class="panel-body">
            ${data.unreadNotifications
              ? `<div class="alert-banner">${icon('bell', 17)}<div>You have ${data.unreadNotifications} unread update${data.unreadNotifications === 1 ? '' : 's'} about assignments and learning.</div></div>`
              : `<p style="font-size:11.5px;color:var(--muted)">You are all caught up. New assignment and learning updates will appear here.</p>`}
          </div>
        </section>
      </aside>
    </div>
  </div>`;
}
