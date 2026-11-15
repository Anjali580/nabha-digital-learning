import { api } from '../api.js';
import { icon } from '../icons.js';
import {
  emptyState, esc, iconTile, progressBar, ring, safeColor
} from '../ui.js';

export async function render(ctx) {
  const { data: subject } = await api.get(`/api/subjects/${encodeURIComponent(ctx.params.subjectId)}`, { signal: ctx.signal });
  const chapters = subject.chapters || [];
  const nextChapter = chapters.find((chapter) => (chapter.completedCount || 0) < chapter.topicCount)
    || chapters[chapters.length - 1];
  const color = safeColor(subject.color);

  return `<div class="page">
    <div class="page-breadcrumb">
      <a href="/app/learn">Learn</a>${icon('chevron-right', 11)}<span>${esc(subject.name)}</span>
    </div>

    <section class="subject-hero" style="--tint:${color}1f">
      <div>
        <div class="subject-title-row">
          ${iconTile(subject.icon, color, 'lg')}
          <div>
            <h1>${esc(subject.name)}</h1>
            <p>${esc(subject.description || '')}</p>
          </div>
        </div>
        <div class="hero-stats">
          <div><strong>${subject.chapterCount}</strong><span>Chapters</span></div>
          <div><strong>${subject.topicCount}</strong><span>Topics</span></div>
          <div><strong>${subject.completedTopics}</strong><span>Completed</span></div>
          <div><strong>${Math.round(subject.progressPercentage || 0)}%</strong><span>Progress</span></div>
        </div>
      </div>
      <div class="subject-hero-side">
        ${ring(subject.progressPercentage || 0, 'complete', 86)}
        ${nextChapter ? `<a class="btn btn-primary btn-sm" href="/app/learn/chapters/${esc(nextChapter.id)}">
          ${subject.completedTopics ? 'Continue' : 'Start'} ${icon('arrow-right', 13)}
        </a>` : ''}
      </div>
    </section>

    <div class="page-head" style="margin-bottom:14px">
      <div><h2 style="font-size:1.15rem">Chapters</h2><p>Open a chapter to see its topics.</p></div>
      <a class="btn btn-outline btn-sm" href="/app/quizzes?subjectId=${esc(subject.id)}">${icon('quiz', 15)} ${esc(subject.name)} quizzes</a>
    </div>

    ${chapters.length ? `<div class="chapter-list">
      ${chapters.map((chapter, index) => {
        const done = chapter.completedCount || 0;
        const total = chapter.topicCount || 0;
        const percentage = total ? Math.round((done / total) * 100) : 0;
        return `<a class="chapter-card ${done === total && total > 0 ? 'done' : ''}" href="/app/learn/chapters/${esc(chapter.id)}">
          <div class="chapter-card-head">
            <span class="chapter-num">${String(index + 1).padStart(2, '0')}</span>
            <div style="min-width:0">
              <h3>${esc(chapter.title)}</h3>
              <p>${esc(chapter.description || '')}</p>
            </div>
            <div class="chapter-meta">
              <span>${done}/${total} topics</span>
              <div class="progress-track"><span style="width:${percentage}%"></span></div>
              ${icon('chevron-right', 15)}
            </div>
          </div>
        </a>`;
      }).join('')}
    </div>` : emptyState({
      iconName: 'layers',
      title: 'No chapters yet',
      text: 'This subject is being prepared. Check back soon.',
      action: '<a class="btn btn-outline btn-sm" href="/app/learn">Back to subjects</a>'
    })}
  </div>`;
}
