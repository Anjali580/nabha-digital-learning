import { icon } from '../icons.js';
import { esc, iconTile, sectionTitle } from '../ui.js';

export async function render() {
  return `<section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="/">Home</a>${icon('chevron-right', 11)}<span>About</span></div>
      <span class="eyebrow">About NabhaLearn</span>
      <h1>Learning that starts where you are</h1>
      <p>NabhaLearn is a demonstration digital learning platform shaped around rural school students in Nabha, Punjab. It brings the school syllabus, honest practice and a wider world of ideas into one lightweight place.</p>
      <div class="page-hero-meta">
        <span class="badge green">${icon('leaf', 11)} Rooted in Nabha</span>
        <span class="badge blue">${icon('book-open', 11)} Classes 6–10</span>
        <span class="badge amber">${icon('info', 11)} Demonstration project</span>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container about-grid">
      <div class="about-copy">
        <span class="eyebrow">Why it exists</span>
        <h2>Not every learning problem needs a bigger app</h2>
        <p>For many students, the barrier is not a lack of ambition. It is a textbook that moves too fast, a phone shared with the family, a weak signal, or simply not knowing which topic to open first.</p>
        <p style="margin-top:12px">NabhaLearn responds with a deliberately small set of actions: read a short lesson, answer a few questions, mark it complete, and see what changed. The interface stays quiet. The progress is real.</p>
        <ul class="about-points">
          <li>${iconTile('target', '#0E9F6E')}<div><strong>One clear next step</strong><span>Every subject and chapter shows what to open next, so you never start from a blank screen.</span></div></li>
          <li>${iconTile('shield', '#4F7DF3')}<div><strong>Private student space</strong><span>Your submissions, quiz attempts and progress belong to your account — not a public leaderboard.</span></div></li>
          <li>${iconTile('leaf', '#2FA36B')}<div><strong>Local context</strong><span>Examples connect school ideas to farms, markets, weather, machines and homes around Punjab.</span></div></li>
        </ul>
        <div class="section-cta">
          <a class="btn btn-primary" href="/courses">Browse the courses ${icon('arrow-right', 16)}</a>
          <a class="btn btn-outline" href="/contact">Talk to the project team</a>
        </div>
      </div>
      <div class="about-media">
        <div class="main-shot"><img src="/assets/learning-together.svg" alt="Students learning together with a tablet and books" width="760" height="560"></div>
        <div class="stat-card">
          ${iconTile('graduation', '#0E9F6E')}
          <div><strong>Built for Classes 6–10</strong><small>Five subjects, short topics and practice in every chapter.</small></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section tint">
    <div class="container">
      <div class="section-head center">
        <span class="eyebrow">What we believe</span>
        <h2>Four principles keep the platform honest</h2>
        <p>These principles guide what we build — and what we deliberately leave out.</p>
      </div>
      <div class="feature-grid">
        <article class="feature-card">${iconTile('book-open', '#0E9F6E', 'lg')}<h3>Understanding over completion</h3><p>A topic is marked complete only when you choose to do so. There is no auto-play, no streak pressure and no fake urgency.</p></article>
        <article class="feature-card blue">${iconTile('chart', '#4F7DF3', 'lg')}<h3>Real data only</h3><p>Your dashboard is calculated from your own completions, quiz attempts and submissions. New accounts begin honestly at zero.</p></article>
        <article class="feature-card amber">${iconTile('shield', '#F2994A', 'lg')}<h3>Safety is a feature</h3><p>Passwords are hashed, sessions use secure cookies, uploads are checked, and one student cannot open another student’s work.</p></article>
        <article class="feature-card violet">${iconTile('compass', '#8367E8', 'lg')}<h3>Curiosity matters</h3><p>Marks are useful, but so is wondering how electricity reaches a fan or why a mirror reverses a reflection.</p></article>
        <article class="feature-card rose">${iconTile('hand', '#D9538C', 'lg')}<h3>Respect the learner</h3><p>No dark patterns, no invented statistics, no pretending that a demo school is a real school.</p></article>
        <article class="feature-card">${iconTile('wifi', '#2FA36B', 'lg')}<h3>Light by default</h3><p>Plain HTML, CSS and JavaScript keep pages small. Lessons remain readable on a low-end phone and a slow connection.</p></article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Who it is for</span>
        <h2>Students first, with room to grow</h2>
      </div>
      <div class="grid-3">
        <article class="panel card-pad">${iconTile('user', '#0E9F6E', 'lg')}<h3 style="margin:14px 0 7px">Students</h3><p style="font-size:13px;color:var(--muted);line-height:1.65">Follow your class syllabus, complete lessons, take quizzes, submit assignments and track what needs revision.</p></article>
        <article class="panel card-pad">${iconTile('users', '#4F7DF3', 'lg')}<h3 style="margin:14px 0 7px">Teachers &amp; schools</h3><p style="font-size:13px;color:var(--muted);line-height:1.65">The data model already separates classes, subjects, assignments and submissions. Teacher and administrator tools are the next phase, not part of this demo.</p></article>
        <article class="panel card-pad">${iconTile('leaf', '#2FA36B', 'lg')}<h3 style="margin:14px 0 7px">Families</h3><p style="font-size:13px;color:var(--muted);line-height:1.65">A calm, readable interface that does not demand constant attention or a new device.</p></article>
      </div>
    </div>
  </section>

  <section class="section tint">
    <div class="container">
      <div class="panel card-pad" style="max-width:860px;margin-inline:auto;background:linear-gradient(145deg,var(--brand-mist),var(--surface))">
        <span class="eyebrow">Transparency</span>
        <h2 style="margin:10px 0 10px">This is a demonstration platform</h2>
        <p style="color:var(--muted);font-size:14px;line-height:1.75">The lessons, quizzes and assignments are seeded sample content created for this project. Schools, classes and the demo student are clearly labelled as demonstrations. No real school records, contact details or student data are included. The platform is designed so that real curriculum and school data can be added without changing the student experience.</p>
        <div class="section-cta">
          <a class="btn btn-outline" href="/privacy">Read the privacy policy</a>
          <a class="btn btn-ghost" href="/terms">Terms of use</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section tight">
    <div class="container">
      <div class="cta-band">
        <div><h2>Ready to take the first small step?</h2><p>Create a free student account and open your first topic today.</p></div>
        <div class="cta-actions">
          <a class="btn btn-white btn-lg" href="/register">Register free ${icon('arrow-right', 17)}</a>
          <a class="btn btn-glass btn-lg" href="/login">Sign in</a>
        </div>
      </div>
    </div>
  </section>`;
}
