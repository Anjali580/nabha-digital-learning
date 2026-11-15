import { api } from '../api.js';
import { icon } from '../icons.js';
import {
  emptyState, esc, iconTile, progressBar, safeColor
} from '../ui.js';

export async function render(ctx) {
  const { data: chapter } = await api.get(`/api/chapters/${encodeURIComponent(ctx.params.chapterId)}`, { signal: ctx.signal });
  const topics = chapter.topics || [];
  const total = chapter.topicCount || topics.length;
  const done = chapter.completedCount || 0;
  const percentage = total ? Math.round((done / total) * 100) : 0;
  const color = safeColor(chapter.subjectColor);
  const nextTopic = topics.find((topic) => !topic.completed) || topics[topics.length - 1];

  return `<div class="page">
    <div class="page-breadcrumb">
      <a href="/app/learn">Learn</a>${icon('chevron-right', 11)}
      <a href="/app/learn/subjects/${esc(chapter.subjectId)}">${esc(chapter.subjectName)}</a>${icon('chevron-right', 11)}
      <span>${esc(chapter.title)}</span>
    </div>

    <section class="subject-hero" style="--tint:${color}1f">
      <div>
        <div class="subject-title-row">
          ${iconTile('layers', color, 'lg')}
          <div>
            <span class="eyebrow">${esc(chapter.subjectName)} · Chapter ${chapter.order}</span>
            <h1>${esc(chapter.title)}</h1>
            <p>${esc(chapter.description || 'Work through the topics below in order, or jump to the one you need.')}</p>
          </div>
        </div>
        <div class="hero-stats">
          <div><strong>${done}/${total}</strong><span>Topics completed</span></div>
          <div><strong>${percentage}%</strong><span>Chapter progress</span></div>
          <div><strong>${topics.reduce((sum, topic) => sum + (topic.estimatedMinutes || 0), 0)}</strong><span>Minutes of reading</span></div>
        </div>
      </div>
      <div class="subject-hero-side">
        ${nextTopic ? `<a class="btn btn-primary btn-sm" href="/app/learn/topics/${esc(nextTopic.id)}">
          ${done ? 'Continue chapter' : 'Start chapter'} ${icon('arrow-right', 13)}
        </a>` : ''}
      </div>
    </section>

    <div class="page-head" style="margin:22px 0 14px">
      <div><h2 style="font-size:1.15rem">Topics in this chapter</h2><p>Each topic includes reading, key points and a short practice question.</p></div>
      <div class="page-head-actions">
        <a class="btn btn-outline btn-sm" href="/app/learn/subjects/${esc(chapter.subjectId)}">${icon('arrow-left', 14)} All chapters</a>
      </div>
    </div>

    ${topics.length ? `<div class="chapter-list">
      ${topics.map((topic, index) => `<div class="chapter-card ${topic.completed ? 'done' : ''}">
        <a class="topic-row ${topic.completed ? 'done' : ''}" href="/app/learn/topics/${esc(topic.id)}">
          <span class="topic-check" aria-hidden="true">${icon('check', 11)}</span>
          <div style="min-width:0">
            <strong>${index + 1}. ${esc(topic.title)}</strong>
            <span>${esc(topic.summary || 'Open this topic to begin.')}</span>
          </div>
          <div class="topic-side">
            <span>${icon('clock', 11)} ${topic.estimatedMinutes} min</span>
            <span>${topic.completed ? 'Completed' : 'Not completed'}</span>
            <span class="topic-play">${icon('play', 10)}</span>
          </div>
        </a>
      </div>`).join('')}
    </div>` : emptyState({
      iconName: 'book-open',
      title: 'No topics in this chapter yet',
      text: 'This chapter is being prepared. In the meantime, you can revise another chapter.',
      action: `<a class="btn btn-outline btn-sm" href="/app/learn/subjects/${esc(chapter.subjectId)}">Back to subject</a>`
    })}

    <section class="panel" style="margin-top:22px">
      <div class="panel-head">
        <div><h2>Chapter checklist</h2><p>Use this simple routine as you work through the chapter</p></div>
      </div>
      <div class="panel-body">
        <div class="grid-3">
          <div class="row" style="align-items:flex-start">${iconTile('book-open', color)}<div><strong style="font-size:12.5px;color:var(--ink)">Read each topic once</strong><p style="font-size:11px;color:var(--muted);margin-top:3px;line-height:1.55">Focus on the main idea before the details.</p></div></div>
          <div class="row" style="align-items:flex-start">${iconTile('lightbulb', '#F2994A')}<div><strong style="font-size:12.5px;color:var(--ink)">Try the practice question</strong><p style="font-size:11px;color:var(--muted);margin-top:3px;line-height:1.55">Answer first, then reveal the model answer.</p></div></div>
          <div class="row" style="align-items:flex-start">${iconTile('quiz', '#8367E8')}<div><strong style="font-size:12.5px;color:var(--ink)">Take the subject quiz</strong><p style="font-size:11px;color:var(--muted);margin-top:3px;line-height:1.55">Check what stuck once you finish the chapter.</p></div></div>
        </div>
        <div class="row between" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line);font-size:10.5px;color:var(--muted);flex-wrap:wrap;gap:10px">
          <span>${done} of ${total} topics completed</span>
          ${progressBar(percentage)}
        </div>
      </div>
    </section>
  </div>`;
}
