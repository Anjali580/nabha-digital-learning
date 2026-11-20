import { api } from '../api.js';
import { CONFIG } from '../config.js';
import { bindBookmarkActions } from '../bookmark.js';
import { refreshShellStats } from '../components/layout.js';
import { icon } from '../icons.js';
import { esc, iconTile, safeColor, safeUrl, toast } from '../ui.js';

function youtubeId(url = '') {
  const value = String(url);
  const match = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : '';
}

function mediaBlock(item) {
  const kind = String(item.kind || '').toUpperCase();
  const url = safeUrl(item.url, '');
  if (!url) return '';
  if (kind === 'IMAGE') {
    return `<figure class="media-figure">
      <img src="${url}" alt="${esc(item.alt || item.caption || 'Lesson illustration')}" loading="lazy">
      ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}
    </figure>`;
  }
  const id = kind === 'YOUTUBE' || /youtu/.test(url) ? youtubeId(item.url) : '';
  if (id) {
    return `<figure class="media-figure">
      <iframe src="${CONFIG.YOUTUBE_EMBED_BASE}/${esc(id)}" title="${esc(item.caption || 'Lesson video')}"
        loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
      ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}
    </figure>`;
  }
  return `<a class="attachment-row" href="${url}" target="_blank" rel="noopener noreferrer">
    ${iconTile('play', '#8367E8')}
    <div><strong>${esc(item.caption || 'Watch this lesson')}</strong><span>Opens in a new tab</span></div>
    ${icon('arrow-up-right', 14)}
  </a>`;
}

function listBlock(items, className = '') {
  if (!items?.length) return '';
  return `<ul class="${className}">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function contentMarkup(content) {
  if (!content) return '';
  const blocks = [];

  (content.sections || []).forEach((section) => {
    if (!section?.heading && !section?.body && !section?.bullets?.length) return;
    blocks.push(`<section class="content-block">
      ${section.heading ? `<h2>${icon('book-open', 18)} ${esc(section.heading)}</h2>` : ''}
      ${section.body ? `<p>${esc(section.body)}</p>` : ''}
      ${listBlock(section.bullets)}
    </section>`);
  });

  if (content.notes?.length) {
    blocks.push(`<section class="content-block">
      <h2>${icon('info', 18)} Good to know</h2>
      ${listBlock(content.notes)}
    </section>`);
  }

  if (content.definitions?.length) {
    blocks.push(`<section class="content-block">
      <h2>${icon('layers', 18)} Key terms</h2>
      <div class="definition-grid">
        ${content.definitions.map((entry) => `<div class="definition-card">
          <strong>${esc(entry.term)}</strong><span>${esc(entry.meaning)}</span>
        </div>`).join('')}
      </div>
    </section>`);
  }

  if (content.examples?.length) {
    blocks.push(`<section class="content-block">
      <h2>${icon('lightbulb', 18)} Examples</h2>
      <div class="example-grid">
        ${content.examples.map((example) => `<div class="example-card">
          ${iconTile('sparkles', '#F2994A')}
          <div><strong>${esc(example.title)}</strong><p>${esc(example.description)}</p></div>
        </div>`).join('')}
      </div>
    </section>`);
  }

  const media = [...(content.images || []), ...(content.videos || [])].map(mediaBlock).filter(Boolean);
  if (media.length) {
    blocks.push(`<section class="content-block">
      <h2>${icon('image', 18)} Look closer</h2>
      <div class="stack-sm">${media.join('')}</div>
    </section>`);
  }

  if (content.keyPoints?.length) {
    blocks.push(`<section class="content-block">
      <h2>${icon('check-circle', 18)} Key points to remember</h2>
      <div class="key-point-list">
        ${content.keyPoints.map((point) => `<div class="key-point">${icon('check', 15)}<span>${esc(point)}</span></div>`).join('')}
      </div>
    </section>`);
  }

  if (content.applications?.length) {
    blocks.push(`<section class="content-block">
      <h2>${icon('globe', 18)} Where you see this in real life</h2>
      ${listBlock(content.applications)}
    </section>`);
  }

  if (content.practiceQuestions?.length) {
    blocks.push(`<section class="content-block">
      <h2>${icon('quiz', 18)} Practice questions</h2>
      <p style="margin-bottom:13px;color:var(--muted);font-size:12px">Try each question in your notebook before revealing the answer.</p>
      ${content.practiceQuestions.map((question) => `<div class="practice-card">
        <strong>${esc(question.question)}</strong>
        <div class="practice-answer"><strong style="display:inline;font-size:11.5px;color:var(--ink)">Model answer: </strong>${esc(question.answer)}</div>
        <button class="practice-reveal" type="button" data-practice-reveal>
          ${icon('eye', 12)} <span>Reveal answer</span>
        </button>
      </div>`).join('')}
    </section>`);
  }

  return blocks.join('');
}

export async function render(ctx) {
  const { data: topic } = await api.get(`/api/topics/${encodeURIComponent(ctx.params.topicId)}`, { signal: ctx.signal });
  const chapterResult = await api.get(`/api/chapters/${encodeURIComponent(topic.chapterId)}`, { signal: ctx.signal })
    .catch(() => null);
  const chapterTopics = chapterResult?.data?.topics || [];
  const color = safeColor(topic.subjectColor);
  const content = contentMarkup(topic.content);

  return `<div class="page">
    <div class="page-breadcrumb">
      <a href="/app/learn">Learn</a>${icon('chevron-right', 11)}
      <a href="/app/learn/subjects/${esc(topic.subjectId)}">${esc(topic.subjectName)}</a>${icon('chevron-right', 11)}
      <a href="/app/learn/chapters/${esc(topic.chapterId)}">${esc(topic.chapterTitle)}</a>${icon('chevron-right', 11)}
      <span>${esc(topic.title)}</span>
    </div>

    <div class="topic-layout">
      <div class="topic-main">
        <header class="topic-head">
          <span class="topic-subject">${icon(topic.subjectIcon || 'book-open', 13)} ${esc(topic.subjectName)} · Chapter ${esc(topic.chapterTitle)}</span>
          <h1>${esc(topic.title)}</h1>
          <p>${esc(topic.summary || '')}</p>
          <div class="topic-meta">
            <span>${icon('clock', 13)} ${topic.estimatedMinutes} min read</span>
            <span>${icon('layers', 13)} Topic ${topic.order}</span>
            <span>${topic.completed ? icon('check-circle', 13) : icon('book-open', 13)} ${topic.completed ? 'Completed' : 'Not completed yet'}</span>
            ${topic.seeded ? `<span>${icon('info', 13)} Seeded lesson content</span>` : ''}
          </div>
        </header>

        ${topic.completed ? `<div class="alert-banner">${icon('check-circle', 17)}
          <div><strong>You have completed this topic.</strong> Revisit it any time — your completion is saved.</div>
        </div>` : `<div class="alert-banner">${icon('lightbulb', 17)}
          <div><strong>Read at your own pace.</strong> When you understand the idea, mark the topic complete so it counts in your progress.</div>
        </div>`}

        ${content || `<section class="content-block"><h2>${icon('book-open', 18)} Lesson coming together</h2>
          <p>This topic does not have written content yet. Check back soon.</p></section>`}

        <nav class="topic-nav" aria-label="Previous and next topic">
          ${topic.previousTopicId ? `<a href="/app/learn/topics/${esc(topic.previousTopicId)}">
            <small>${icon('arrow-left', 11)} Previous</small><strong>${esc(topic.previousTopicTitle || 'Previous topic')}</strong>
          </a>` : '<span></span>'}
          ${topic.nextTopicId ? `<a class="next" href="/app/learn/topics/${esc(topic.nextTopicId)}">
            <small>Next ${icon('arrow-right', 11)}</small><strong>${esc(topic.nextTopicTitle || 'Next topic')}</strong>
          </a>` : '<span></span>'}
        </nav>

        ${topic.relatedTopics?.length ? `<section class="panel">
          <div class="panel-head"><div><h2>Related topics</h2><p>Keep building the same idea</p></div></div>
          <div class="panel-body"><div class="topic-outline">
            ${topic.relatedTopics.map((related) => `<a href="/app/learn/topics/${esc(related.id)}">
              ${icon(related.completed ? 'check-circle' : 'book-open', 12)}
              <span>${esc(related.title)} <small style="color:var(--muted-2)">· ${related.estimatedMinutes} min</small></span>
            </a>`).join('')}
          </div></div>
        </section>` : ''}
      </div>

      <aside class="topic-side">
        <div class="topic-side-card">
          <h3>Your progress</h3>
          <button class="btn ${topic.completed ? 'btn-soft' : 'btn-primary'} btn-block" type="button"
            data-complete-topic data-topic-id="${esc(topic.id)}" ${topic.completed ? 'disabled' : ''}>
            ${icon(topic.completed ? 'check-circle' : 'check', 16)} ${topic.completed ? 'Completed' : 'Mark as complete'}
          </button>
          <button class="btn btn-outline btn-block" type="button" data-bookmark-toggle
            data-target-type="TOPIC" data-target-id="${esc(topic.id)}"
            data-bookmark-id="${esc(topic.bookmarkId || '')}"
            aria-pressed="${topic.bookmarkId ? 'true' : 'false'}">
            ${icon('bookmark', 16)} ${topic.bookmarkId ? 'Saved for later' : 'Save for later'}
          </button>
          ${topic.nextTopicId ? `<a class="btn btn-ghost btn-block" href="/app/learn/topics/${esc(topic.nextTopicId)}">Next topic ${icon('arrow-right', 15)}</a>` : ''}
        </div>

        ${chapterTopics.length ? `<div class="topic-side-card">
          <h3>${esc(topic.chapterTitle)}</h3>
          <div class="topic-outline">
            ${chapterTopics.map((chapterTopic) => `<a class="${chapterTopic.id === topic.id ? 'current' : ''}" href="/app/learn/topics/${esc(chapterTopic.id)}">
              ${icon(chapterTopic.completed ? 'check-circle' : 'chevron-right', 12)}
              <span>${esc(chapterTopic.title)}</span>
            </a>`).join('')}
          </div>
        </div>` : ''}

        <div class="topic-side-card">
          <h3>Keep going</h3>
          <div class="topic-outline">
            <a href="/app/quizzes?subjectId=${esc(topic.subjectId)}">${icon('quiz', 12)} Quizzes for ${esc(topic.subjectName)}</a>
            <a href="/app/learn/chapters/${esc(topic.chapterId)}">${icon('layers', 12)} All topics in this chapter</a>
            <a href="/app/explore">${icon('compass', 12)} Explore beyond the book</a>
          </div>
        </div>
      </aside>
    </div>
  </div>`;
}

export function mount(ctx) {
  const root = ctx.root;
  bindBookmarkActions(root);

  root.querySelectorAll('[data-practice-reveal]').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.practice-card');
      const revealed = card?.classList.toggle('revealed');
      button.querySelector('span').textContent = revealed ? 'Hide answer' : 'Reveal answer';
    });
  });

  const completeButton = root.querySelector('[data-complete-topic]');
  completeButton?.addEventListener('click', async () => {
    if (completeButton.disabled) return;
    completeButton.disabled = true;
    const original = completeButton.innerHTML;
    completeButton.innerHTML = '<span class="spinner" aria-hidden="true"></span> Saving…';
    try {
      const { message } = await api.post(`/api/topics/${encodeURIComponent(completeButton.dataset.topicId)}/complete`);
      completeButton.innerHTML = `${icon('check-circle', 16)} Completed`;
      completeButton.classList.remove('btn-primary');
      completeButton.classList.add('btn-soft');
      toast(message || 'Topic marked as complete.', 'success');
      refreshShellStats();
      root.querySelector('.alert-banner')?.remove();
      const meta = root.querySelector('.topic-meta');
      if (meta) {
        const last = meta.lastElementChild;
        if (last && !last.textContent.includes('Completed')) last.innerHTML = `${icon('check-circle', 13)} Completed`;
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        toast(error.message, 'error');
        completeButton.disabled = false;
        completeButton.innerHTML = original;
      }
    }
  });
}
