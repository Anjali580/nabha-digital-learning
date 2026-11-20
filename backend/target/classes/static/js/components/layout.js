import { api } from '../api.js';
import { auth } from '../auth.js';
import { icon } from '../icons.js';
import { homeForRole, isAdmin, isStaff } from '../roles.js';
import { avatar, bindThemeToggles, esc, progressBar } from '../ui.js';

function e(value) { return esc(value); }

/**
 * Persist theme changes made with the header/shell toggle so a reload does not
 * snap back to the theme stored in the account preferences.
 */
function persistThemePreference(theme) {
  if (!auth.getUser()) return;
  const preferences = auth.getPreferences() || {};
  const base = isTeacher(auth.getUser()) ? '/api/teacher' : '/api/student';
  api.put(`${base}/preferences`, {
    language: preferences.language || 'en',
    theme,
    emailNotifications: Boolean(preferences.emailNotifications),
    assignmentReminders: Boolean(preferences.assignmentReminders),
    dailyGoalTopics: preferences.dailyGoalTopics || 2
  }).then(({ data }) => {
    if (data) auth.setPreferences(data);
  }).catch(() => { /* the theme is still applied locally */ });
}

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
  bindThemeToggles(root, persistThemePreference);
}

/* ------------------------------------------------------------------- panel */
const STUDENT_SIDE_SECTIONS = [
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

const TEACHER_SIDE_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { href: '/app/teacher/dashboard', label: 'Overview', icon: 'dashboard' },
      { href: '/app/teacher/students', label: 'Students', icon: 'users' },
      { href: '/app/teacher/assignments', label: 'Assignments', icon: 'assignment', badge: 'reviews' }
    ]
  },
  {
    label: 'Account',
    items: [
      { href: '/app/profile', label: 'Profile', icon: 'user' },
      { href: '/app/settings', label: 'Settings', icon: 'settings' }
    ]
  }
];

const ADMIN_SIDE_SECTIONS = [
  {
    label: 'Administration',
    items: [
      { href: '/app/admin/dashboard', label: 'Overview', icon: 'dashboard' },
      { href: '/app/admin/users', label: 'People', icon: 'users' },
      { href: '/app/teacher/dashboard', label: 'Teacher workspace', icon: 'school' }
    ]
  },
  {
    label: 'Account',
    items: [
      { href: '/app/profile', label: 'Profile', icon: 'user' },
      { href: '/app/settings', label: 'Settings', icon: 'settings' }
    ]
  }
];

const STUDENT_BOTTOM_NAV = [
  { href: '/app/dashboard', label: 'Home', icon: 'dashboard' },
  { href: '/app/learn', label: 'Learn', icon: 'book-open' },
  { href: '/app/explore', label: 'Explore', icon: 'compass' },
  { href: '/app/assignments', label: 'Tasks', icon: 'assignment' },
  { href: '/app/progress', label: 'Progress', icon: 'chart' }
];

const TEACHER_BOTTOM_NAV = [
  { href: '/app/teacher/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/app/teacher/students', label: 'Students', icon: 'users' },
  { href: '/app/teacher/assignments', label: 'Tasks', icon: 'assignment' },
  { href: '/app/profile', label: 'Profile', icon: 'user' }
];

const ADMIN_BOTTOM_NAV = [
  { href: '/app/admin/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/app/admin/users', label: 'People', icon: 'users' },
  { href: '/app/teacher/dashboard', label: 'Teaching', icon: 'school' },
  { href: '/app/profile', label: 'Profile', icon: 'user' }
];

let shellStats = {
  unread: 0, dailyGoal: 2, todayCompleted: 0, pending: 0, totalStudents: 0, totalTeachers: 0, totalClasses: 0, loaded: false
};

function isTeacher(user = auth.getUser()) {
  return isStaff(user);
}

function isActive(path, href) {
  if (href === '/app/dashboard' || href === '/app/teacher/dashboard' || href === '/app/admin/dashboard') return path === href;
  return path === href || path.startsWith(`${href}/`);
}

function navMarkup(path, user) {
  const sections = isAdmin(user)
    ? ADMIN_SIDE_SECTIONS
    : isTeacher(user) ? TEACHER_SIDE_SECTIONS : STUDENT_SIDE_SECTIONS;
  return sections.map((section) => `
    <p class="side-label">${section.label}</p>
    ${section.items.map((item) => {
      const active = isActive(path, item.href);
      let count = '';
      if (item.badge === 'unread' && shellStats.unread > 0) {
        count = `<span class="side-count" data-unread-count>${shellStats.unread}</span>`;
      } else if (item.badge === 'reviews' && shellStats.pending > 0) {
        count = `<span class="side-count" data-review-count>${shellStats.pending}</span>`;
      }
      return `<a class="side-link ${active ? 'active' : ''}" href="${item.href}" ${active ? 'aria-current="page"' : ''}>
        ${icon(item.icon, 18)}<span>${item.label}</span>${count}
      </a>`;
    }).join('')}
  `).join('');
}

function sidebarMarkup(user, path) {
  const admin = isAdmin(user);
  const teacher = isTeacher(user);
  const staff = admin || teacher;
  const goal = shellStats.dailyGoal || 2;
  const done = Math.min(shellStats.todayCompleted || 0, goal);
  const goalPct = goal ? Math.round((done / goal) * 100) : 0;
  const home = homeForRole(user);
  const workspaceLabel = admin ? 'Admin' : teacher ? 'Teacher' : 'Student';
  const subtitle = admin
    ? (user?.schoolName || 'School administrator')
    : teacher ? (user?.degree || 'Teacher') : (user?.className || 'Student');
  const badgeClass = admin ? 'blue' : teacher ? 'violet' : 'green';
  return `<aside class="sidebar" id="app-sidebar" aria-label="${workspaceLabel} menu">
    <div class="sidebar-head">
      ${brandLockup({ href: home })}
      <button class="sidebar-close" type="button" data-sidebar-close aria-label="Close menu">${icon('close', 19)}</button>
    </div>
    <div class="student-mini ${staff ? 'teacher-mini' : ''}">
      ${avatar(user, 'sm')}
      <div>
        <strong>${e(user?.fullName || workspaceLabel)}</strong>
        <span>${e(subtitle)}</span>
      </div>
      ${user?.demo ? '<span class="badge amber">Demo</span>' : `<span class="badge ${badgeClass}">${workspaceLabel}</span>`}
    </div>
    <nav class="side-nav" aria-label="${workspaceLabel} panel">${navMarkup(path, user)}</nav>
    <div class="sidebar-foot">
      ${admin ? `<div class="sidebar-goal admin-summary">
        <div class="row"><strong>School overview</strong><span data-admin-students>${shellStats.totalStudents || 0} students</span></div>
        <div data-admin-progress>${progressBar(100)}</div>
        <small data-admin-summary>${shellStats.totalTeachers || 0} teachers · ${shellStats.totalClasses || 0} classes</small>
      </div>` : teacher ? `<div class="sidebar-goal teacher-summary">
        <div class="row"><strong>Teaching overview</strong><span data-teacher-students>${shellStats.totalStudents || 0} students</span></div>
        <div data-teacher-progress>${progressBar(shellStats.pending > 0 ? 100 : 0, 'amber')}</div>
        <small data-teacher-summary>${shellStats.pending > 0
          ? `${shellStats.pending} submission${shellStats.pending === 1 ? '' : 's'} waiting for review.`
          : 'All caught up. New submissions will appear here.'}</small>
      </div>` : `<div class="sidebar-goal">
        <div class="row"><strong>Today’s goal</strong><span data-goal-count>${done}/${goal} topics</span></div>
        <div data-goal-progress>${progressBar(goalPct)}</div>
        <small data-goal-text>${done >= goal ? 'Goal reached — well done!' : 'One small lesson at a time.'}</small>
      </div>`}
      ${user?.demo ? `<div class="sidebar-demo">${icon('info', 14)}<span>This is a demo account. ${admin
        ? 'Account and class changes are saved to this demo school.'
        : teacher ? 'New assignments and reviews are saved to this demo teacher.'
        : 'Your progress starts empty and is saved to this demo student.'}</span></div>` : ''}
      <button class="side-signout" type="button" data-logout>${icon('logout', 17)}<span>Sign out</span></button>
    </div>
  </aside>`;
}

function topbarMarkup(user, route) {
  const teacher = isTeacher(user);
  const admin = isAdmin(user);
  return `<header class="topbar">
    <div class="topbar-left">
      <button class="mobile-menu" type="button" data-sidebar-open aria-label="Open menu">${icon('menu', 20)}</button>
      <div class="topbar-crumb">
        <span>${admin ? 'Admin' : teacher ? 'Teacher' : 'Student'}</span>${icon('chevron-right', 13)}<strong>${e(route.title || 'Dashboard')}</strong>
      </div>
    </div>
    <div class="topbar-right">
      ${teacher ? '' : `<form class="topbar-search" role="search" data-global-search>
        <label class="sr-only" for="topbar-search-input">Search lessons, subjects and explore articles</label>
        ${icon('search', 16)}
        <input id="topbar-search-input" name="q" type="search" placeholder="Search lessons, quizzes…" autocomplete="off">
        <kbd>/</kbd>
      </form>`}
      <button class="topbar-icon" type="button" data-theme-toggle aria-label="Switch theme"></button>
      ${teacher ? '' : `<a class="topbar-icon" href="/app/notifications" aria-label="Notifications" style="position:relative">
        ${icon('bell', 18)}
        <span class="dot ${shellStats.unread ? '' : 'hide'}" data-notif-dot></span>
      </a>`}
      <a class="topbar-profile" href="/app/profile" aria-label="Your profile">
        ${avatar(user, 'sm')}
        ${icon('chevron-down', 13)}
      </a>
    </div>
  </header>`;
}

function bottomNavMarkup(path, user) {
  const nav = isAdmin(user)
    ? ADMIN_BOTTOM_NAV
    : isTeacher(user) ? TEACHER_BOTTOM_NAV : STUDENT_BOTTOM_NAV;
  return `<nav class="bottom-nav" aria-label="Quick navigation">
    ${nav.map((item) => {
      const active = isActive(path, item.href);
      const dot = !isTeacher(user) && item.href === '/app/assignments' && shellStats.pending > 0
        ? '<span class="dot"></span>' : '';
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
    ${bottomNavMarkup(path, user)}
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

  bindThemeToggles(root, persistThemePreference);

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
  const reviewCount = document.querySelector('[data-review-count]');
  if (reviewCount) {
    if (shellStats.pending > 0) {
      reviewCount.textContent = shellStats.pending > 9 ? '9+' : String(shellStats.pending);
      reviewCount.classList.remove('hide');
    } else {
      reviewCount.remove();
    }
  }
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

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };
  const setBar = (selector, value) => {
    const node = document.querySelector(`${selector} .progress-track > span`);
    if (node) node.style.width = `${Math.max(0, Math.min(100, value))}%`;
  };

  if (isAdmin(auth.getUser())) {
    const students = shellStats.totalStudents || 0;
    setText('[data-admin-students]', `${students} student${students === 1 ? '' : 's'}`);
    setText('[data-admin-summary]', `${shellStats.totalTeachers || 0} teacher${shellStats.totalTeachers === 1 ? '' : 's'} · ${shellStats.totalClasses || 0} classes`);
  } else if (isTeacher(auth.getUser())) {
    const count = shellStats.totalStudents || 0;
    setText('[data-teacher-students]', `${count} student${count === 1 ? '' : 's'}`);
    setBar('[data-teacher-progress]', shellStats.pending > 0 ? 100 : 0);
    setText('[data-teacher-summary]', shellStats.pending > 0
      ? `${shellStats.pending} submission${shellStats.pending === 1 ? '' : 's'} waiting for review.`
      : 'All caught up. New submissions will appear here.');
  } else {
    const goal = shellStats.dailyGoal || 2;
    const done = Math.min(shellStats.todayCompleted || 0, goal);
    setText('[data-goal-count]', `${done}/${goal} topics`);
    setBar('[data-goal-progress]', goal ? Math.round((done / goal) * 100) : 0);
    setText('[data-goal-text]', done >= goal ? 'Goal reached — well done!' : 'One small lesson at a time.');
  }
}

export async function refreshShellStats() {
  if (!auth.isAuthenticated()) return shellStats;
  try {
    if (isAdmin(auth.getUser())) {
      const { data } = await api.get('/api/admin/dashboard');
      setShellStats({
        unread: 0,
        pending: data?.pendingReviews || 0,
        totalStudents: data?.totalStudents || 0,
        totalTeachers: data?.totalTeachers || 0,
        totalClasses: data?.totalClasses || 0
      });
    } else if (isTeacher(auth.getUser())) {
      const { data } = await api.get('/api/teacher/dashboard');
      setShellStats({
        unread: data?.unreadNotifications || 0,
        pending: data?.pendingReviews || 0,
        totalStudents: data?.totalStudents || 0
      });
    } else {
      const { data } = await api.get('/api/student/dashboard');
      setShellStats({
        unread: data?.unreadNotifications || 0,
        dailyGoal: data?.overview?.dailyGoalTopics || 2,
        todayCompleted: data?.overview?.todayCompletedTopics || 0,
        pending: data?.overview?.assignmentsPending || 0
      });
    }
  } catch (error) {
    if (error?.status !== 401) console.warn('Sidebar stats unavailable:', error.message);
  }
  return shellStats;
}

export function getShellStats() {
  return shellStats;
}
