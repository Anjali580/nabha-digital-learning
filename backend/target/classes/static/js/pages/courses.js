import { api } from '../api.js';
import { auth } from '../auth.js';
import { icon } from '../icons.js';
import { esc, iconTile, safeColor } from '../ui.js';

let controller = null;

function courseCard(subject, signedIn) {
  const href = signedIn
    ? `/app/learn/subjects/${subject.id}`
    : `/login?next=${encodeURIComponent(`/app/learn/subjects/${subject.id}`)}`;
  return `<a class="course-card" href="${href}" style="--tint:${safeColor(subject.color)}1f">
    <div class="course-top">
      ${iconTile(subject.icon, subject.color, 'lg')}
      <div>
        <h3>${esc(subject.name)}</h3>
        <p>Class ${esc(subject.classId?.replace('class-', '') || '')} · ${subject.chapterCount} chapters</p>
      </div>
    </div>
    <p class="course-desc">${esc(subject.description || '')}</p>
    <div class="course-foot">
      <div class="row">
        <span>${icon('layers', 12)} ${subject.chapterCount} chapters</span>
        <span>${icon('book-open', 12)} ${subject.topicCount} topics</span>
      </div>
      <span class="link-arrow">${signedIn ? 'Open' : 'Preview'} ${icon('arrow-right', 13)}</span>
    </div>
  </a>`;
}

export async function render() {
  return `<section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="/">Home</a>${icon('chevron-right', 11)}<span>Courses</span></div>
      <span class="eyebrow">Academic learning</span>
      <h1>Courses for Classes 6 to 10</h1>
      <p>Choose a class to see the subjects. Every subject is split into chapters and short topics, with practice questions and quizzes along the way.</p>
      <div class="page-hero-meta">
        <span class="badge green">${icon('book-open', 11)} 5 subjects per class</span>
        <span class="badge blue">${icon('clock', 11)} Short lessons</span>
        <span class="badge violet">${icon('shield', 11)} Free student account</span>
      </div>
    </div>
  </section>
  <section class="section tight">
    <div class="container">
      <div class="class-tabs" id="class-tabs" aria-label="Choose a class">
        ${Array.from({ length: 5 }, (_, index) => `<span class="skeleton" style="width:78px;height:38px;border-radius:999px"></span>`).join('')}
      </div>
      <div class="course-grid" id="course-grid">
        ${Array.from({ length: 6 }, () => '<div class="skeleton" style="height:210px;border-radius:26px"></div>').join('')}
      </div>
      <p class="hint" style="margin-top:18px">This demonstration curriculum is seeded with clearly labelled sample content. No real school records are used.</p>
    </div>
  </section>
  <section class="section tint">
    <div class="container">
      <div class="section-head center">
        <span class="eyebrow">Inside a course</span>
        <h2>From chapter to topic to practice</h2>
        <p>Every subject follows the same calm structure, so you always know where you are.</p>
      </div>
      <div class="feature-grid">
        <article class="feature-card">${iconTile('layers', '#0E9F6E', 'lg')}<h3>Chapters</h3><p>See the full chapter list with the number of topics and how many you have completed.</p></article>
        <article class="feature-card blue">${iconTile('book-open', '#4F7DF3', 'lg')}<h3>Topics</h3><p>Read one focused lesson at a time, with definitions, examples, key points and practice questions.</p></article>
        <article class="feature-card violet">${iconTile('quiz', '#8367E8', 'lg')}<h3>Checks</h3><p>Finish with a short quiz or assignment. Your score and feedback are saved to your account.</p></article>
      </div>
      <div class="section-cta" style="justify-content:center">
        <a class="btn btn-primary" href="/register">Create your free account ${icon('arrow-right', 16)}</a>
      </div>
    </div>
  </section>`;
}

export async function mount(ctx) {
  controller?.abort();
  controller = new AbortController();
  const signedIn = auth.isAuthenticated();
  const tabs = document.getElementById('class-tabs');
  const grid = document.getElementById('course-grid');

  const loadSubjects = async (classId) => {
    grid.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton" style="height:210px;border-radius:26px"></div>').join('');
    try {
      const { data } = await api.get('/api/subjects', { query: { classId }, signal: controller.signal });
      if (!data?.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>No subjects yet</h3><p>This class does not have published subjects right now.</p></div>`;
        return;
      }
      grid.innerHTML = data.map((subject) => courseCard(subject, signedIn)).join('');
    } catch (error) {
      if (error.name === 'AbortError') return;
      grid.innerHTML = `<div class="error-box" style="grid-column:1/-1">${icon('alert', 18)}<span>${esc(error.message)}</span></div>`;
    }
  };

  try {
    const { data: classes } = await api.get('/api/classes', { signal: controller.signal });
    const preferred = ctx.query.get('class')
      || auth.getUser()?.classId
      || 'class-8';
    const activeId = classes.some((item) => item.id === preferred) ? preferred : classes[0]?.id;
    tabs.innerHTML = classes.map((item) => `<button class="chip ${item.id === activeId ? 'active' : ''}" type="button" data-class-id="${esc(item.id)}">${esc(item.name)}</button>`).join('');
    tabs.querySelectorAll('[data-class-id]').forEach((button) => {
      button.addEventListener('click', () => {
        tabs.querySelectorAll('.chip').forEach((node) => node.classList.remove('active'));
        button.classList.add('active');
        const url = new URL(window.location.href);
        url.searchParams.set('class', button.dataset.classId);
        history.replaceState({}, '', url.pathname + url.search);
        loadSubjects(button.dataset.classId);
      });
    });
    await loadSubjects(activeId);
  } catch (error) {
    if (error.name === 'AbortError') return;
    tabs.innerHTML = '';
    grid.innerHTML = `<div class="error-box" style="grid-column:1/-1">${icon('alert', 18)}<span>${esc(error.message)}</span></div>`;
  }
}

export function cleanup() {
  controller?.abort();
  controller = null;
}
