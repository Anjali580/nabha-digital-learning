import { api } from '../api.js';
import { auth } from '../auth.js';
import { icon } from '../icons.js';
import { avatar, bindThemeToggles, esc, progressBar } from '../ui.js';

function e(value) { return esc(value); }

export function brandLockup({ href = '/', compact = false } = {}) {
  return `<a class="brand" href="${href}" aria-label="NabhaLearn home">
    <span class="brand-mark" aria-hidden="true">NL</span>
    <span class="brand-text">
      <strong>NabhaLearn</strong>
      <small>Learn Beyond Books</small>
    </span>
  </a>`;
}

const PUBLIC_NAV = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/courses', label: 'Courses', key: 'courses' },
  { href: '/about', label: 'About', key: 'about' },
  { href: '/contact', label: 'Contact', key: 'contact' }
];

function publicHeader(active) {
  const nav = PUBLIC_NAV.map((item) => `
    <a href="${item.href}" class="${active === item.key ? 'active' : ''}" ${active === item.key ? 'aria-current="page"' : ''}>${item.label}</a>
  `).join('');
  return `<header class="site-header" id="site-header">
    <div class="container site-header-inner">
      ${brandLockup()}
      <nav class="site-nav" aria-label="Main navigation">${nav}</nav>
      <div class="site-actions">
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch theme"></button>
        <a class="btn btn-outline btn-sm login-btn" href="/login">Login</a>
        <a class="btn btn-primary btn-sm register-btn" href="/register">Register ${icon('arrow-right', 15)}</a>
        <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open menu" aria-expanded="false">${icon('menu', 21)}</button>
      </div>
    </div>
    <div class="mobile-nav" id="mobile-nav">
      <div class="container">
        ${PUBLIC_NAV.map((item) => `<a href="${item.href}" class="${active === item.key ? 'active' : ''}">${item.label}</a>`).join('')}
        <div class="mobile-actions">
          <a class="btn btn-outline btn-sm" href="/login">Login</a>
          <a class="btn btn-primary btn-sm" href="/register">Create account</a>
        </div>
      </div>
    </div>
  </header>`;
}

function publicFooter() {
  return `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          ${brandLockup()}
          <p>A free digital learning companion built for rural school students in Nabha, Punjab. Clear lessons, honest progress and a little curiosity every day.</p>
          <div class="footer-note">${icon('info', 15)}<span>This is a demonstration project. Seeded lessons are labelled, demo schools are marked, and no real student records are used.</span></div>
        </div>
        <div class="footer-col">
          <h4>Learn</h4>
          <a href="/courses">Academic courses</a>
          <a href="/login?next=%2Fapp%2Fexplore">Beyond the book</a>
          <a href="/login?next=%2Fapp%2Fquizzes">Practice quizzes</a>
          <a href="/login?next=%2Fapp%2Fassignments">Assignments</a>
        </div>
        <div class="footer-col">
          <h4>Platform</h4>
          <a href="/about">Our approach</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/#explore">Explore categories</a>
          <a href="/#why">Why NabhaLearn</a>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <a href="/contact">Contact us</a>
          <a href="/login">Student sign in</a>
          <a href="/register">Create an account</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms of use</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} NabhaLearn · Made for learners in Nabha, Punjab.</span>
        <nav aria-label="Legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </div>
  </footer>`;
}

export function renderPublicLayout({ content, active = '' }) {
  return `<div class="public-site">
    ${publicHeader(active)}
    <main id="main">${content}</main>
    ${publicFooter()}
  </div>`;
}

export function mountPublicLayout(root, { signal } = {}) {
  const header = root.querySelector('#site-header');
  const toggle = root.querySelector('[data-nav-toggle]');
  const mobileNav = root.querySelector('#mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = icon(open ? 'close' : 'menu', 21);
    });
  }
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true, signal });
  }
  bindThemeToggles(root);
}

/* ------------------------------------------------------------------- panel */
const SIDE_SECTIONS = [
  {
    label: 'Learning',
    items: [
      { href: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { href: '/app/learn', label: 'Learn', icon: 'book-open' },
      { href: '/app/explore', label: 'Explore', icon: 'compass' },
      { href: '/app/assignments', label: 'Assignments', icon: 'assignment', match: '/app/assignments' },
      { href: '/app/progress', label: 'Progress', icon: 'chart' }
    ]
  },
  {
    label: 'Practice',
    items: [
      { href: '/app/quizzes', label: 'Quizzes', icon: 'quiz' },
      { href: '/app/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
      { href: '/app/search', label: 'Search', icon: 'search' }
    ]
  },
  {
    label: 'Account',
    items: [
      { href: '/app/notifications', label: 'Notifications', icon: 'bell', badge: 'unread' },
      { href: '/app/profile', label: 'Profile', icon: 'user' },
      { href: '/app/settings', label: 'Settings', icon: 'settings' }
    ]
  }
];

const BOTTOM_NAV = [
  { href: '/app/dashboard', label: 'Home', icon: 'dashboard' },
  { href: '/app/learn', label: 'Learn', icon: 'book-open' },
  { href: '/app/explore', label: 'Explore', icon: 'compass' },
  { href: '/app/assignments', label: 'Tasks', icon: 'assignment' },
  { href: '/app/progress', label: 'Progress', icon: 'chart' }
];

let shellStats = { unread: 0, dailyGoal: 2, todayCompleted: 0, loaded: false };

function isActive(path, href) {
  if (href === '/app/dashboard') return path === href;
  return path === href || path.startsWith(`${href}/`);
}

function navMarkup(path) {
  return SIDE_SECTIONS.map((section) => `
    <p class="side-label">${section.label}</p>
    ${section.items.map((item) => {
      const active = isActive(path, item.href);
      const count = item.badge === 'unread' && shellStats.unread > 0
        ? `<span class="side-count" data-unread-count>${shellStats.unread}</span>` : '';
      return `<a class="side-link ${active ? 'active' : ''}" href="${item.href}" ${active ? 'aria-current="page"' : ''}>
        ${icon(item.icon, 18)}<span>${item.label}</span>${count}
      </a>`;
    }).join('')}
  `).join('');
}

function sidebarMarkup(user, path) {
  const goal = shellStats.dailyGoal || 2;
  const done = Math.min(shellStats.todayCompleted || 0, goal);
  const goalPct = goal ? Math.round((done / goal) * 100) : 0;
  return `<aside class="sidebar" id="app-sidebar" aria-label="Student menu">
    <div class="sidebar-head">
      ${brandLockup({ href: '/app/dashboard' })}
      <button class="sidebar-close" type="button" data-sidebar-close aria-label="Close menu">${icon('close', 19)}</button>
    </div>
    <div class="student-mini">
      ${avatar(user, 'sm')}
      <div>
        <strong>${e(user?.fullName || 'Student')}</strong>
        <span>${e(user?.className || 'Student')}</span>
      </div>
      ${user?.demo ? '<span class="badge amber">Demo</span>' : '<span class="badge green">Student</span>'}
    </div>
    <nav class="side-nav" aria-label="Student panel">${navMarkup(path)}</nav>
    <div class="sidebar-foot">
      <div class="sidebar-goal">
        <div class="row"><strong>Today’s goal</strong><span>${done}/${goal} topics</span></div>
        ${progressBar(goalPct)}
        <small>${done >= goal ? 'Goal reached — well done!' : 'One small lesson at a time.'}</small>
      </div>
      ${user?.demo ? `<div class="sidebar-demo">${icon('info', 14)}<span>This is a demo account. Your progress starts empty and is saved to this demo student.</span></div>` : ''}
      <button class="side-signout" type="button" data-logout>${icon('logout', 17)}<span>Sign out</span></button>
    </div>
  </aside>`;
}

function topbarMarkup(user, route) {
  return `<header class="topbar">
    <div class="topbar-left">
      <button class="mobile-menu" type="button" data-sidebar-open aria-label="Open menu">${icon('menu', 20)}</button>
      <div class="topbar-crumb">
        <span>Student</span>${icon('chevron-right', 13)}<strong>${e(route.title || 'Dashboard')}</strong>
      </div>
    </div>
    <div class="topbar-right">
      <form class="topbar-search" role="search" data-global-search>
        <label class="sr-only" for="topbar-search-input">Search lessons, subjects and explore articles</label>
        ${icon('search', 16)}
        <input id="topbar-search-input" name="q" type="search" placeholder="Search lessons, quizzes…" autocomplete="off">
        <kbd>/</kbd>
      </form>
      <button class="topbar-icon" type="button" data-theme-toggle aria-label="Switch theme"></button>
      <a class="topbar-icon" href="/app/notifications" aria-label="Notifications" style="position:relative">
        ${icon('bell', 18)}
        <span class="dot ${shellStats.unread ? '' : 'hide'}" data-notif-dot></span>
      </a>
      <a class="topbar-profile" href="/app/profile" aria-label="Your profile">
        ${avatar(user, 'sm')}
        ${icon('chevron-down', 13)}
      </a>
    </div>
  </header>`;
}

function bottomNavMarkup(path) {
  return `<nav class="bottom-nav" aria-label="Quick navigation">
    ${BOTTOM_NAV.map((item) => {
      const active = isActive(path, item.href);
      const dot = item.href === '/app/assignments' && shellStats.pending > 0 ? '<span class="dot"></span>' : '';
      return `<a class="bottom-link ${active ? 'active' : ''}" href="${item.href}" ${active ? 'aria-current="page"' : ''}>
        ${icon(item.icon, 19)}<span>${item.label}</span>${dot}
      </a>`;
    }).join('')}
  </nav>`;
}

export function renderAppLayout({ content, route, path }) {
  const user = auth.getUser();
  return `<div class="app-shell">
    ${sidebarMarkup(user, path)}
    <div class="app-main">
      ${topbarMarkup(user, route)}
      <main id="main" class="app-content">${content}</main>
    </div>
    ${bottomNavMarkup(path)}
  </div>`;
}

export function mountAppLayout(root, { signal } = {}) {
  const sidebar = root.querySelector('#app-sidebar');
  const openButton = root.querySelector('[data-sidebar-open]');
  const closeButton = root.querySelector('[data-sidebar-close]');
  let backdrop = null;

  const close = () => {
    sidebar?.classList.remove('open');
    backdrop?.remove();
    backdrop = null;
  };
  const open = () => {
    sidebar?.classList.add('open');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      backdrop.addEventListener('click', close);
      document.body.appendChild(backdrop);
    }
  };
  openButton?.addEventListener('click', open);
  closeButton?.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  }, { signal });

  bindThemeToggles(root);

  root.querySelector('[data-logout]')?.addEventListener('click', async () => {
    await auth.logout();
    window.dispatchEvent(new CustomEvent('nl:navigate', { detail: { url: '/login', replace: true } }));
  });

  root.querySelector('[data-global-search]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector('input');
    const q = input.value.trim();
    if (q.length < 2) {
      input.focus();
      return;
    }
    window.dispatchEvent(new CustomEvent('nl:navigate', {
      detail: { url: `/app/search?q=${encodeURIComponent(q)}` }
    }));
  });

  // Press "/" to jump into search, unless the user is typing in a field.
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = document.activeElement?.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || document.activeElement?.isContentEditable) return;
    const input = root.querySelector('#topbar-search-input');
    if (input) {
      event.preventDefault();
      input.focus();
    }
  }, { signal });

  refreshShellStats();
}

export function setShellStats(stats = {}) {
  shellStats = { ...shellStats, ...stats, loaded: true };
  const count = document.querySelector('[data-unread-count]');
  if (count) {
    if (shellStats.unread > 0) {
      count.textContent = shellStats.unread > 9 ? '9+' : String(shellStats.unread);
      count.classList.remove('hide');
    } else {
      count.remove();
    }
  }
  const dot = document.querySelector('[data-notif-dot]');
  if (dot) dot.classList.toggle('hide', !shellStats.unread);
  const pendingDots = document.querySelectorAll('.bottom-link .dot');
  pendingDots.forEach((node) => node.remove());
  if (shellStats.pending > 0) {
    const tasks = document.querySelector('.bottom-link[href="/app/assignments"]');
    if (tasks) {
      const span = document.createElement('span');
      span.className = 'dot';
      tasks.appendChild(span);
    }
  }
}

export async function refreshShellStats() {
  if (!auth.isAuthenticated()) return shellStats;
  try {
    const { data } = await api.get('/api/student/dashboard');
    setShellStats({
      unread: data?.unreadNotifications || 0,
      dailyGoal: data?.overview?.dailyGoalTopics || 2,
      todayCompleted: data?.overview?.todayCompletedTopics || 0,
      pending: data?.overview?.assignmentsPending || 0
    });
  } catch (error) {
    if (error?.status !== 401) console.warn('Sidebar stats unavailable:', error.message);
  }
  return shellStats;
}

export function getShellStats() {
  return shellStats;
}
