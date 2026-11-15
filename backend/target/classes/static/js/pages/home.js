import { api } from '../api.js';
import { icon } from '../icons.js';
import { esc, iconTile, sectionTitle } from '../ui.js';

const FEATURES = [
  ['book-open', 'Structured lessons', 'Every subject is organised into chapters and short topics, so you always know the next step.', '#0E9F6E'],
  ['quiz', 'Practice quizzes', 'Answer questions, submit, and see your score with a clear explanation for every answer.', '#8367E8'],
  ['assignment', 'Real assignments', 'Read your teacher’s instructions and submit written work, a PDF or a photo of your page.', '#F2994A'],
  ['chart', 'Honest progress', 'See completed topics, quiz results and weak areas — calculated from your real activity.', '#4F7DF3'],
  ['compass', 'Beyond the book', 'Explore electricity, farming, space and life skills in twelve curated categories.', '#2FA36B'],
  ['life-buoy', 'Built for low-end phones', 'Lightweight pages, clear type and no unnecessary downloads. Learning works on a basic connection.', '#D9538C']
];

const STRIP = [
  ['graduation', 'Classes 6–10', 'School curriculum'],
  ['book-open', '104 lessons', 'Across five subjects'],
  ['quiz', '22 quizzes', 'With answer review'],
  ['chart', 'Real progress', 'No invented scores'],
  ['compass', '12 categories', 'Explore beyond books']
];

const STEPS = [
  ['01', 'Create your account', 'Choose your class, add your school name if you like, and sign in securely. Your account is free.', '2 minutes'],
  ['02', 'Learn one topic at a time', 'Read a short lesson, try the practice questions, then mark the topic complete when you understand it.', '8–14 minutes'],
  ['03', 'Practise and improve', 'Take a quiz, submit an assignment and use your progress page to see what to revisit next.', 'At your pace']
];

const BENEFITS = [
  ['target', 'Clear next step', 'No endless scrolling. Each subject shows exactly which topic comes next.'],
  ['shield', 'Private by design', 'Your work belongs to your account. Other students cannot open your submissions.'],
  ['clock', 'Short lessons', 'Most topics take 8–14 minutes — enough to fit around school and home work.'],
  ['leaf', 'Rooted in Nabha', 'Examples use villages, farms, classrooms and everyday life around Punjab.']
];

export async function render() {
  return `
  <section class="hero">
    <span class="hero-blob one"></span>
    <span class="hero-blob two"></span>
    <span class="hero-blob three"></span>
    <span class="hero-doodle d1">${icon('sparkles', 38)}</span>
    <span class="hero-doodle d2">${icon('book-open', 46)}</span>
    <span class="hero-doodle d3">${icon('star', 24)}</span>
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="hero-badge"><span class="icon-tile">${icon('leaf', 14)}</span> Learning for every child in Nabha</span>
        <h1>Small Steps,<br><span class="accent">Brighter</span> Futures</h1>
        <p class="hero-lead">A friendly learning companion for rural school students. Understand your lessons, practise at your own pace, and explore the world beyond the textbook — all in one place.</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="/register">Start learning free ${icon('arrow-right', 18)}</a>
          <a class="btn btn-outline btn-lg" href="/courses">Explore courses ${icon('compass', 17)}</a>
        </div>
        <ul class="hero-points">
          <li>${icon('check-circle', 16)} Class 6 to 10</li>
          <li>${icon('check-circle', 16)} English, Hindi &amp; Punjabi</li>
          <li>${icon('check-circle', 16)} Free to use</li>
        </ul>
      </div>
      <div class="hero-visual">
        <div class="hero-card">
          <img src="/assets/classroom.svg" alt="A teacher and three students learning together in a bright classroom" width="800" height="620">
        </div>
        <div class="floating-badge dreams">
          <span class="icon-tile">${icon('sparkles', 19)}</span>
          <div><strong>Small Steps, Big Dreams</strong><small>Every lesson counts</small></div>
        </div>
        <div class="floating-badge lesson">
          <span class="icon-tile">${icon('target', 19)}</span>
          <div><strong>One topic a day</strong><small>Small and doable</small></div>
        </div>
      </div>
    </div>
    <div class="container feature-strip">
      <div class="feature-strip-inner">
        ${STRIP.map(([iconName, title, sub]) => `<div class="feature-strip-item">
          ${iconTile(iconName, '#0E9F6E')}
          <div><strong>${title}</strong><small>${sub}</small></div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" id="about" style="padding-top:130px">
    <div class="container about-grid">
      <div class="about-media">
        <div class="main-shot"><img src="/assets/learning-together.svg" alt="Two students sharing a tablet under a tree near their school" width="760" height="560"></div>
        <div class="quote-chip">“Learning should feel possible, not overwhelming.”</div>
        <div class="stat-card">
          ${iconTile('map-pin', '#0E9F6E')}
          <div><strong>Built for Nabha, Punjab</strong><small>Examples, language and pace shaped around rural learners.</small></div>
        </div>
      </div>
      <div class="about-copy">
        <span class="eyebrow">Our approach</span>
        <h2>A calm place to learn, not another noisy app</h2>
        <p>NabhaLearn brings the school syllabus, practice and progress together in a simple interface. No feed, no distractions, no invented leaderboards — just the next useful lesson.</p>
        <ul class="about-points">
          <li>${iconTile('book-open', '#0E9F6E')}<div><strong>Lessons tied to your class</strong><span>Mathematics, Science, English, Social Science and Computer Studies, organised chapter by chapter.</span></div></li>
          <li>${iconTile('shield', '#4F7DF3')}<div><strong>Your work stays yours</strong><span>Secure accounts, private submissions and progress visible only to you.</span></div></li>
          <li>${iconTile('compass', '#8367E8')}<div><strong>Curiosity beyond marks</strong><span>Short reads that connect school ideas to farms, machines, space and daily life.</span></div></li>
        </ul>
        <div class="section-cta">
          <a class="btn btn-primary" href="/about">Why we built NabhaLearn ${icon('arrow-right', 16)}</a>
          <a class="btn btn-ghost" href="/courses">Browse courses</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section tint" id="features">
    <div class="container">
      <div class="section-head center">
        <span class="eyebrow">Everything in one place</span>
        <h2>Six tools that support real learning</h2>
        <p>Each feature connects to the same account and the same syllabus, so nothing you do disappears into a separate app.</p>
      </div>
      <div class="feature-grid">
        ${FEATURES.map(([iconName, title, text, color], index) => `<article class="feature-card ${['', 'blue', 'amber', 'violet', 'rose', ''][index]}">
          ${iconTile(iconName, color, 'lg')}
          <h3>${title}</h3>
          <p>${text}</p>
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" id="how-it-works">
    <div class="container">
      <div class="section-head center">
        <span class="eyebrow">How it works</span>
        <h2>Three steps, repeated at your pace</h2>
        <p>You do not need to finish everything at once. One topic today is progress.</p>
      </div>
      <div class="steps">
        ${STEPS.map(([num, title, text, tag]) => `<article class="step-card">
          <div class="step-num">${num}</div>
          <h3>${title}</h3>
          <p>${text}</p>
          <span class="badge green step-tag">${icon('clock', 11)} ${tag}</span>
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="section mint" id="explore">
    <div class="container">
      <div class="section-head split">
        <div>
          <span class="eyebrow">Explore beyond the book</span>
          <h2>Twelve doors to curiosity</h2>
          <p>Short, carefully written reads that answer the questions textbooks often skip.</p>
        </div>
        <a class="btn btn-outline" href="/login?next=%2Fapp%2Fexplore">Open the library ${icon('arrow-right', 16)}</a>
      </div>
      <div class="category-grid" id="home-categories" aria-live="polite">
        ${Array.from({ length: 8 }, () => `<div class="skeleton" style="height:142px;border-radius:18px"></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" id="why">
    <div class="container why-grid">
      <div class="why-visual">
        <div class="why-panel">
          <h3>What “brighter” means here</h3>
          <p>Not a promise of perfect marks. A steady habit of understanding one more thing each day.</p>
          <div class="why-list">
            ${BENEFITS.map(([iconName, title, text]) => `<div class="why-list-item">
              <span class="icon-tile">${icon(iconName, 17)}</span>
              <div><strong>${title}</strong><span>${text}</span></div>
            </div>`).join('')}
          </div>
        </div>
        <div class="why-sticker">
          ${iconTile('leaf', '#0E9F6E')}
          <div><strong>One topic a day</strong><small>Small, doable, real</small></div>
        </div>
      </div>
      <div class="why-copy">
        <span class="eyebrow">Why NabhaLearn</span>
        <h2>Designed for the phone you actually have</h2>
        <p>Many learning apps assume fast Wi-Fi, a new device and hours of free time. NabhaLearn starts from a different assumption: you may have twenty minutes, a shared phone and a weak signal.</p>
        <p style="margin-top:12px">So the pages are light, the lessons are short, and every screen has one clear action. If a connection drops, you can pick up where you left off.</p>
        <div class="why-benefits">
          ${BENEFITS.map(([iconName, title, text]) => `<div class="why-benefit">
            ${icon(iconName, 17)}
            <div><strong>${title}</strong><span>${text}</span></div>
          </div>`).join('')}
        </div>
        <div class="section-cta">
          <a class="btn btn-primary" href="/register">Create your free account ${icon('arrow-right', 16)}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section tight">
    <div class="container">
      <div class="cta-band">
        <div>
          <h2>Your next lesson is already waiting.</h2>
          <p>Join with your class, learn at your own pace, and keep every step of your progress in one place.</p>
        </div>
        <div class="cta-actions">
          <a class="btn btn-white btn-lg" href="/register">Register free ${icon('arrow-right', 17)}</a>
          <a class="btn btn-glass btn-lg" href="/login">I have an account</a>
        </div>
      </div>
    </div>
  </section>`;
}

export async function mount(ctx) {
  const grid = document.getElementById('home-categories');
  if (!grid) return;
  try {
    const { data } = await api.get('/api/explore/categories', { signal: ctx.signal });
    if (!Array.isArray(data) || !data.length) throw new Error('No categories');
    grid.innerHTML = data.map((category) => {
      const next = `/app/explore?category=${encodeURIComponent(category.slug)}`;
      return `<a class="category-card" href="/login?next=${encodeURIComponent(next)}">
        <span class="cat-icon" style="background:${esc(category.color)}">${icon(category.icon || 'compass', 21)}</span>
        <h4>${esc(category.title)}</h4>
        <p>${esc(category.description || '')}</p>
        <div class="cat-meta">
          <span class="cat-count">${category.count} article${category.count === 1 ? '' : 's'}</span>
          <span>Open ${icon('arrow-right', 11)}</span>
        </div>
      </a>`;
    }).join('');
  } catch (error) {
    if (error.name === 'AbortError') return;
    grid.innerHTML = `<div class="panel" style="padding:24px;grid-column:1/-1">
      <p style="font-size:13px;color:var(--muted)">Explore categories could not load right now. You can still browse the academic courses.</p>
      <a class="btn btn-primary btn-sm" style="margin-top:10px" href="/courses">View courses</a>
    </div>`;
  }
}
