import { icon } from '../icons.js';
import {
  badge, dueInfo, esc, formatDate, iconTile, progressBar, safeColor, safeUrl, statusBadge, timeAgo
} from '../ui.js';

export function subjectCard(subject, { compact = false } = {}) {
  const color = safeColor(subject.color);
  const total = subject.totalTopics ?? subject.topicCount ?? 0;
  const done = subject.completedTopics ?? 0;
  const percentage = subject.percentage ?? subject.progressPercentage ?? 0;
  // The progress endpoint returns `subjectId`, while the dashboard returns `id`.
  const subjectId = subject.id ?? subject.subjectId ?? '';
  return `<a class="subject-card" href="/app/learn/subjects/${esc(subjectId)}" style="--tint:${color}22">
    <div class="subject-card-head">
      ${iconTile(subject.icon || 'book', color, 'lg')}
      <div>
        <h3>${esc(subject.name)}</h3>
        <p>${subject.chapterCount ?? 0} chapters · ${total} topics</p>
      </div>
    </div>
    ${compact ? '' : `<p class="subject-desc">${esc(subject.description || 'Build understanding step by step.')}</p>`}
    <div>
      <div class="subject-card-meta"><span>${done} of ${total} completed</span><strong>${Math.round(percentage)}%</strong></div>
      ${progressBar(percentage)}
    </div>
    <div class="subject-card-foot">
      <span class="badge ${done === total && total > 0 ? 'green' : ''}">${done === total && total > 0 ? 'Completed' : done ? 'Continue learning' : 'Start learning'}</span>
      <span class="link-arrow">${done ? 'Continue' : 'Open'} ${icon('arrow-right', 13)}</span>
    </div>
  </a>`;
}

export function quizCard(quiz) {
  const color = safeColor(quiz.subjectColor || '#8367E8');
  const best = quiz.bestPercentage;
  return `<a class="quiz-card" href="/app/quizzes/${esc(quiz.id)}">
    <div class="quiz-card-top">
      ${iconTile('quiz', color)}
      <div><h3>${esc(quiz.title)}</h3><p>${esc(quiz.subjectName || 'Quiz')}</p></div>
    </div>
    <p>${esc(quiz.description || 'Check your understanding with a short quiz.')}</p>
    <div class="quiz-card-meta">
      <span>${icon('list', 11)} ${quiz.questionCount} questions</span>
      <span>${icon('clock', 11)} ${quiz.durationMinutes} min</span>
      <span>${icon('award', 11)} ${quiz.totalMarks} marks</span>
    </div>
    <div class="quiz-card-foot">
      <span class="best">${best !== null && best !== undefined
        ? `Best <strong>${Math.round(best)}%</strong> · ${quiz.attempts} attempt${quiz.attempts === 1 ? '' : 's'}`
        : 'Not attempted yet'}</span>
      <span class="btn btn-soft btn-sm">${best !== null && best !== undefined ? 'Try again' : 'Start'} ${icon('arrow-right', 13)}</span>
    </div>
  </a>`;
}

export function assignmentCard(assignment) {
  const due = dueInfo(assignment.dueDate);
  const color = safeColor(assignment.subjectColor || '#F2994A');
  const status = assignment.overdue && assignment.status === 'PENDING' ? 'LATE' : assignment.status;
  return `<a class="assignment-card" href="/app/assignments/${esc(assignment.id)}">
    <div class="assignment-card-top">
      ${iconTile(assignment.subjectIcon || 'assignment', color)}
      <div>
        <h3>${esc(assignment.title)}</h3>
        <p>${esc(assignment.subjectName || 'Assignment')}</p>
      </div>
      ${statusBadge(status)}
    </div>
    <p>${esc(assignment.description || 'Open the assignment to read the full instructions.')}</p>
    <div class="assignment-meta">
      <span class="${due.tone === 'danger' ? 'overdue' : ''}">${icon('calendar', 11)} ${esc(due.text)}</span>
      <span>${icon('award', 11)} ${assignment.maxMarks} marks</span>
      ${assignment.attachmentCount ? `<span>${icon('file', 11)} ${assignment.attachmentCount} attachment${assignment.attachmentCount === 1 ? '' : 's'}</span>` : ''}
    </div>
    <div class="assignment-card-foot">
      <span>${assignment.submittedAt ? `Submitted ${timeAgo(assignment.submittedAt)}` : 'Not submitted yet'}</span>
      ${assignment.marks !== null && assignment.marks !== undefined
        ? `<span class="score">${assignment.marks}/${assignment.maxMarks}</span>`
        : `<span class="link-arrow">Open ${icon('arrow-right', 12)}</span>`}
    </div>
  </a>`;
}

export function exploreCard(item, { saved = false } = {}) {
  const cover = safeUrl(item.coverImage, '/assets/explore/general-knowledge.svg');
  const color = safeColor(item.categoryColor || '#8367E8');
  return `<article class="explore-card">
    <a class="explore-cover" href="/app/explore/${esc(item.slug)}" aria-label="Read ${esc(item.title)}">
      <img src="${cover}" alt="" loading="lazy">
      <span class="badge" style="color:${color}">${esc(item.categoryTitle || 'Explore')}</span>
      <button class="bookmark-btn ${saved || item.bookmarkId ? 'saved' : ''}" type="button"
        data-bookmark-toggle data-target-type="EXPLORE" data-target-id="${esc(item.id)}"
        data-bookmark-id="${esc(item.bookmarkId || '')}" aria-label="${saved || item.bookmarkId ? 'Remove bookmark' : 'Save article'}">
        ${icon('bookmark', 15)}
      </button>
    </a>
    <a class="explore-card-body" href="/app/explore/${esc(item.slug)}">
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.shortDescription || '')}</p>
      <div class="explore-card-meta">
        <span>${icon('clock', 11)} ${item.readingTimeMinutes || 3} min read</span>
        <span>${icon('arrow-right', 11)} Read more</span>
      </div>
    </a>
  </article>`;
}

export function continueCard(item) {
  const color = safeColor(item.subjectColor || '#0E9F6E');
  return `<a class="continue-card" href="/app/learn/topics/${esc(item.topicId)}">
    ${iconTile(item.subjectIcon || 'book', color)}
    <div style="min-width:0">
      <strong>${esc(item.title)}</strong>
      <span>${esc(item.subjectName)} · ${esc(item.chapterTitle)}</span>
      <div class="continue-meta">
        <span>${icon('clock', 10)} ${item.estimatedMinutes} min</span>
        <span>${item.completed ? 'Completed' : 'In progress'}</span>
      </div>
    </div>
    <span class="continue-resume">${icon('play', 13)}</span>
  </a>`;
}

export function statTile({ iconName, color, value, label, note = '' }) {
  return `<div class="stat-tile">
    ${iconTile(iconName, color)}
    <div>
      <strong>${esc(value)}</strong>
      <span>${esc(label)}</span>
      ${note ? `<small>${esc(note)}</small>` : ''}
    </div>
  </div>`;
}

export function bookmarkCard(bookmark) {
  const typeIcons = { TOPIC: 'book-open', EXPLORE: 'sparkles', QUIZ: 'quiz', SUBJECT: 'layers' };
  const typeLabels = { TOPIC: 'Lesson', EXPLORE: 'Explore', QUIZ: 'Quiz', SUBJECT: 'Subject' };
  return `<article class="bookmark-card">
    <div class="bookmark-top">
      ${iconTile(typeIcons[bookmark.targetType] || 'bookmark', '#0E9F6E')}
      <button class="bookmark-remove" type="button" data-bookmark-delete data-bookmark-id="${esc(bookmark.id)}"
        aria-label="Remove bookmark">${icon('trash', 14)}</button>
    </div>
    <h3><a href="${safeUrl(bookmark.link, '#')}">${esc(bookmark.title)}</a></h3>
    <p>${esc(bookmark.subtitle || 'Saved item')}</p>
    <div class="bookmark-foot">
      <span>${esc(typeLabels[bookmark.targetType] || bookmark.targetType)}</span>
      <span>Saved ${formatDate(bookmark.createdAt)}</span>
    </div>
  </article>`;
}

export function notificationIcon(type) {
  const map = {
    WELCOME: ['sparkles', '#0E9F6E'],
    ASSIGNMENT_NEW: ['assignment', '#F2994A'],
    ASSIGNMENT_REMINDER: ['clock', '#E9A23B'],
    ASSIGNMENT_GRADED: ['award', '#0E9F6E'],
    SUBMISSION_RECEIVED: ['check-circle', '#4F7DF3'],
    QUIZ_RESULT: ['quiz', '#8367E8'],
    LEARNING_UPDATE: ['book-open', '#4F7DF3'],
    SYSTEM: ['info', '#61707D']
  };
  return map[type] || ['bell', '#61707D'];
}

export { badge };
