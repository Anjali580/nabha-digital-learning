import { api } from '../api.js';
import { icon } from '../icons.js';
import { emptyState, esc, iconTile, progressBar, timeAgo } from '../ui.js';

function subjectLink(subject) {
  return `/app/learn/subjects/${encodeURIComponent(subject.subjectId || subject.id || '')}`;
}

export async function render(ctx) {
  const { data } = await api.get('/api/student/progress', { signal: ctx.signal });
  const overall = data?.overall || {};
  const subjects = data?.subjects || [];
  const quiz = data?.quizPerformance || {};
  const weakTopics = data?.weakTopics || [];
  const activity = data?.recentActivity || [];

  return `<div class="page">
    <div class="page-head">
      <div>
        <span class="eyebrow">Your learning</span>
        <h1>Progress</h1>
        <p>Every completed topic, quiz attempt and saved bookmark in one place.</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-outline btn-sm" href="/app/learn">${icon('book-open', 15)} Continue learning</a>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-tile"><strong>${overall.completedTopics || 0}/${overall.totalTopics || 0}</strong><span>Topics completed</span></div>
      <div class="stat-tile"><strong>${overall.quizzesAttempted || 0}</strong><span>Quiz attempts</span></div>
      <div class="stat-tile"><strong>${Math.round(overall.averageQuizPercentage || 0)}%</strong><span>Average quiz</span></div>
      <div class="stat-tile"><strong>${overall.streakDays || 0}</strong><span>Day streak</span></div>
    </div>

    <section class="panel" style="margin-top:18px">
      <div class="panel-head">
        <div><h2>Overall progress</h2><p>${overall.completedTopics || 0} of ${overall.totalTopics || 0} topics completed</p></div>
        <span class="badge green">${Math.round(overall.percentage || 0)}%</span>
      </div>
      <div class="panel-body">
        ${progressBar(overall.percentage || 0)}
        <div class="meta-row" style="margin-top:12px">
          <span>${icon('assignment', 13)} ${overall.assignmentsCompleted || 0} assignments submitted</span>
          <span>${icon('assignment', 13)} ${overall.assignmentsPending || 0} pending</span>
          <span>${icon('bookmark', 13)} ${overall.bookmarks || 0} bookmarks</span>
          <span>${icon('target', 13)} ${overall.todayCompletedTopics || 0}/${overall.dailyGoalTopics || 2} today</span>
        </div>
      </div>
    </section>

    <section class="panel" style="margin-top:18px">
      <div class="panel-head">
        <div><h2>Subjects</h2><p>Progress across your class subjects</p></div>
      </div>
      <div class="panel-body">
        ${subjects.length ? `<div class="stack-sm">
          ${subjects.map((subject) => `<a class="panel" style="padding:14px;display:block" href="${subjectLink(subject)}">
            <div class="row between" style="gap:12px;flex-wrap:wrap">
              <div class="row" style="gap:10px;min-width:0">
                ${iconTile(subject.icon || 'book', subject.color || '#0E9F6E')}
                <div style="min-width:0">
                  <strong>${esc(subject.name)}</strong>
                  <p style="margin:2px 0 0;color:var(--muted);font-size:11.5px">${esc(subject.description || '')}</p>
                </div>
              </div>
              <span class="badge">${subject.completedTopics || 0}/${subject.totalTopics || 0} topics</span>
            </div>
            <div style="margin-top:10px">${progressBar(subject.percentage || 0)}</div>
          </a>`).join('')}
        </div>` : emptyState({ iconName: 'book-open', title: 'No subjects yet', text: 'Your class subjects will appear here once they are published.' })}
      </div>
    </section>

    <div class="grid-2" style="margin-top:18px;align-items:start">
      <section class="panel">
        <div class="panel-head"><div><h2>Quiz performance</h2><p>${quiz.attempts || 0} attempt${quiz.attempts === 1 ? '' : 's'}</p></div></div>
        <div class="panel-body">
          ${(quiz.recent || []).length ? `<div class="stack-sm">
            ${quiz.recent.map((attempt) => `<a class="row between" style="gap:10px;padding:9px 0;border-bottom:1px solid var(--line)" href="/app/quizzes/results/${encodeURIComponent(attempt.attemptId)}">
              <div style="min-width:0"><strong style="font-size:12.5px">${esc(attempt.quizTitle || 'Quiz')}</strong>
                <p style="margin:2px 0 0;color:var(--muted);font-size:11px">${attempt.score || 0}/${attempt.totalMarks || 0} marks · ${esc(timeAgo(attempt.submittedAt))}</p>
              </div>
              <span class="badge ${(attempt.percentage || 0) >= 50 ? 'green' : 'amber'}">${Math.round(attempt.percentage || 0)}%</span>
            </a>`).join('')}
          </div>` : emptyState({ iconName: 'quiz', title: 'No quiz attempts yet', text: 'Take a quiz after a topic to check what stuck.' })}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><h2>Topics to revisit</h2><p>Based on quiz answers</p></div></div>
        <div class="panel-body">
          ${weakTopics.length ? `<div class="stack-sm">
            ${weakTopics.map((topic) => `<a class="row between" style="gap:10px;padding:9px 0;border-bottom:1px solid var(--line)" href="/app/learn/topics/${encodeURIComponent(topic.topicId)}">
              <div style="min-width:0"><strong style="font-size:12.5px">${esc(topic.title)}</strong>
                <p style="margin:2px 0 0;color:var(--muted);font-size:11px">${esc(topic.subjectName || '')} · ${topic.correctAnswers || 0}/${topic.questionsAnswered || 0} correct</p>
              </div>
              <span class="badge amber">${Math.round(topic.accuracy || 0)}%</span>
            </a>`).join('')}
          </div>` : emptyState({ iconName: 'lightbulb', title: 'Nothing to revisit yet', text: 'Quiz answers will show which topics need another look.' })}
        </div>
      </section>
    </div>

    <section class="panel" style="margin-top:18px">
      <div class="panel-head"><div><h2>Recent activity</h2><p>Your last learning steps</p></div></div>
      <div class="panel-body">
        ${activity.length ? `<div class="activity-list">
          ${activity.map((item) => `<a class="activity-item" href="${esc(item.link || '#')}">
            ${iconTile(item.icon || 'check', item.color || '#0E9F6E')}
            <div style="min-width:0"><strong>${esc(item.title)}</strong><span>${esc(item.subtitle || '')}</span></div>
            <time>${esc(timeAgo(item.occurredAt))}</time>
          </a>`).join('')}
        </div>` : emptyState({ iconName: 'chart', title: 'No activity yet', text: 'Complete a topic or take a quiz, and your history will start here.' })}
      </div>
    </section>
  </div>`;
}
