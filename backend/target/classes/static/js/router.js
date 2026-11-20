import { auth } from './auth.js';
import {
  mountAppLayout, mountPublicLayout, renderAppLayout, renderPublicLayout
} from './components/layout.js';
import { icon } from './icons.js';
import { homeForRole } from './roles.js';
import { errorPanel, esc, spinnerBlock } from './ui.js';

const ROUTES = [
  { path: '/', title: 'Learn Beyond Books', load: () => import('./pages/home.js'), layout: 'public', active: 'home' },
  { path: '/courses', title: 'Courses for Classes 6–10', load: () => import('./pages/courses.js'), layout: 'public', active: 'courses' },
  { path: '/about', title: 'About NabhaLearn', load: () => import('./pages/about.js'), layout: 'public', active: 'about' },
  { path: '/contact', title: 'Contact', load: () => import('./pages/contact.js'), layout: 'public', active: 'contact' },
  { path: '/privacy', title: 'Privacy policy', load: () => import('./pages/legal.js'), layout: 'public', active: '' },
  { path: '/terms', title: 'Terms of use', load: () => import('./pages/legal.js'), layout: 'public', active: '' },
  { path: '/login', title: 'Sign in', load: () => import('./pages/auth.js'), layout: 'auth', guestOnly: true },
  { path: '/register', title: 'Create your account', load: () => import('./pages/auth.js'), layout: 'auth', guestOnly: true },
  { path: '/app', redirect: '/app/dashboard', auth: true },
  { path: '/app/dashboard', title: 'Dashboard', load: () => import('./pages/dashboard.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/learn', title: 'Learn', load: () => import('./pages/learn.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/learn/subjects/:subjectId', title: 'Subject', load: () => import('./pages/subject.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/learn/chapters/:chapterId', title: 'Chapter', load: () => import('./pages/chapter.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/learn/topics/:topicId', title: 'Topic', load: () => import('./pages/topic.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/explore', title: 'Explore', load: () => import('./pages/explore.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/explore/:slug', title: 'Explore article', load: () => import('./pages/explore-detail.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/quizzes', title: 'Quizzes', load: () => import('./pages/quizzes.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/quizzes/results/:attemptId', title: 'Quiz result', load: () => import('./pages/quiz-result.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/quizzes/:quizId/attempt', title: 'Quiz attempt', load: () => import('./pages/quiz-runner.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/quizzes/:quizId', title: 'Quiz', load: () => import('./pages/quiz-intro.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/assignments', title: 'Assignments', load: () => import('./pages/assignments.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/assignments/:assignmentId', title: 'Assignment', load: () => import('./pages/assignment-detail.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/progress', title: 'Progress', load: () => import('./pages/progress.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/bookmarks', title: 'Bookmarks', load: () => import('./pages/bookmarks.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/notifications', title: 'Notifications', load: () => import('./pages/notifications.js'), layout: 'app', auth: true, roles: ['STUDENT'] },
  { path: '/app/teacher', redirect: '/app/teacher/dashboard', auth: true },
  { path: '/app/teacher/dashboard', title: 'Teacher dashboard', load: () => import('./pages/teacher-dashboard.js'), layout: 'app', auth: true, roles: ['TEACHER', 'ADMIN'] },
  { path: '/app/teacher/students', title: 'Students', load: () => import('./pages/teacher-students.js'), layout: 'app', auth: true, roles: ['TEACHER', 'ADMIN'] },
  { path: '/app/teacher/assignments', title: 'Assignments', load: () => import('./pages/teacher-assignments.js'), layout: 'app', auth: true, roles: ['TEACHER', 'ADMIN'] },
  { path: '/app/teacher/assignments/:assignmentId', title: 'Assignment reviews', load: () => import('./pages/teacher-assignment-detail.js'), layout: 'app', auth: true, roles: ['TEACHER', 'ADMIN'] },
  { path: '/app/admin', redirect: '/app/admin/dashboard', auth: true },
  { path: '/app/admin/dashboard', title: 'Admin dashboard', load: () => import('./pages/admin-dashboard.js'), layout: 'app', auth: true, roles: ['ADMIN'] },
  { path: '/app/admin/users', title: 'People', load: () => import('./pages/admin-users.js'), layout: 'app', auth: true, roles: ['ADMIN'] },
  { path: '/app/profile', title: 'Profile', load: () => import('./pages/profile.js'), layout: 'app', auth: true },
  { path: '/app/settings', title: 'Settings', load: () => import('./pages/settings.js'), layout: 'app', auth: true },
  { path: '/app/search', title: 'Search', load: () => import('./pages/search.js'), layout: 'app', auth: true, roles: ['STUDENT'] }
];

const compiled = ROUTES.map((route) => ({
  ...route,
  regex: route.path.includes(':')
    ? new RegExp(`^${route.path.replace(/:[^/]+/g, '([^/]+)').replace(/\/$/, '')}/?$`)
    : new RegExp(`^${route.path.replace(/\/$/, '') || '/'}/?$`)
}));

let root = null;
let controller = null;
let activePage = null;
let navCounter = 0;

function matchPath(path) {
  for (const route of compiled) {
    const match = path.match(route.regex);
    if (!match) continue;
    const keys = [...route.path.matchAll(/:([^/]+)/g)].map((m) => m[1]);
    const params = {};
    keys.forEach((key, index) => { params[key] = decodeURIComponent(match[index + 1]); });
    return { route, params };
  }
  return null;
}

function notFoundRoute() {
  return {
    route: { path: '*', title: 'Page not found', load: () => import('./pages/not-found.js'), layout: 'public', active: '' },
    params: {}
  };
}

function fullPath(url) {
  return url.pathname + url.search;
}

/**
 * Static servers such as VS Code Live Server open the shell as `/index.html`.
 * Treat that URL as the site root so the landing page renders instead of the
 * not-found page.
 */
function normalizeIndexPath(url) {
  if (url.pathname === '/index.html' || url.pathname === '/index.htm') {
    url.pathname = '/';
  }
  return url;
}

function canAccess(route, user = auth.getUser()) {
  if (!route.roles || !route.roles.length) return true;
  return route.roles.includes(user?.role);
}

function updateTitle(title) {
  document.title = title ? `${title} · NabhaLearn` : 'NabhaLearn — Learn Beyond Books';
}

function loadingContent() {
  return `<div class="page"><div class="skeleton title" style="width:32%;margin-bottom:18px"></div>${spinnerBlock('Loading your page…')}</div>`;
}

function shellContent(route, url) {
  if (route.layout === 'app') {
    return renderAppLayout({
      content: loadingContent(),
      route,
      path: url.pathname
    });
  }
  if (route.layout === 'public') {
    return renderPublicLayout({
      content: loadingContent(),
      active: route.active || ''
    });
  }
  return `<main id="main">${loadingContent()}</main>`;
}

async function renderUrl(target, { replace = false, initial = false } = {}) {
  const url = normalizeIndexPath(target instanceof URL ? target : new URL(target, window.location.origin));

  if (!initial) {
    if (replace) history.replaceState({}, '', fullPath(url));
    else history.pushState({}, '', fullPath(url));
  }

  const found = matchPath(url.pathname) || notFoundRoute();
  let { route, params } = found;

  if (route.redirect) {
    const target = route.path === '/app' ? homeForRole(auth.getUser()) : route.redirect;
    const redirectUrl = new URL(target, window.location.origin);
    redirectUrl.search = url.search;
    return renderUrl(redirectUrl, { replace: true });
  }

  if (route.guestOnly && auth.isAuthenticated()) {
    const next = url.searchParams.get('next');
    return renderUrl(next && next.startsWith('/') ? next : homeForRole(auth.getUser()), { replace: true });
  }

  if (route.auth && !auth.isAuthenticated()) {
    const login = new URL('/login', window.location.origin);
    login.searchParams.set('next', fullPath(url));
    return renderUrl(login, { replace: true });
  }

  if (route.auth && !canAccess(route)) {
    return renderUrl(homeForRole(auth.getUser()), { replace: true });
  }

  controller?.abort();
  controller = new AbortController();
  const token = ++navCounter;

  activePage?.cleanup?.();
  activePage = null;

  updateTitle(route.title);
  document.documentElement.classList.toggle('in-app', route.layout === 'app');
  root.innerHTML = shellContent(route, url);

  if (route.layout === 'app') {
    mountAppLayout(root, { signal: controller.signal });
  } else if (route.layout === 'public') {
    mountPublicLayout(root, { signal: controller.signal });
  }

  // Bind the static shell links immediately so the page feels responsive even
  // while its data request is still in flight.
  const main = root.querySelector('#main');
  if (main) {
    main.setAttribute('tabindex', '-1');
    main.innerHTML = loadingContent();
  }

  let page;
  try {
    page = await route.load();
    if (token !== navCounter || controller.signal.aborted) return;
    const ctx = {
      params,
      query: url.searchParams,
      path: url.pathname,
      url,
      signal: controller.signal,
      route,
      navigate
    };
    const content = await page.render(ctx);
    if (token !== navCounter || controller.signal.aborted) return;
    const currentMain = root.querySelector('#main');
    if (currentMain) currentMain.innerHTML = content;
    if (route.layout === 'app') {
      // Keep crumb/title aligned if a page sets a more specific title.
      const crumb = root.querySelector('.topbar-crumb strong');
      if (crumb && route.title) crumb.textContent = route.title;
    }
    activePage = page;
    if (page.mount) await page.mount({ ...ctx, root: currentMain || root });
    if (token !== navCounter) return;
    if (!url.hash) {
      window.scrollTo({ top: 0, behavior: initial ? 'auto' : 'instant' });
    } else {
      const targetNode = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (targetNode) targetNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0 });
    }
  } catch (error) {
    if (error?.name === 'AbortError' || token !== navCounter) return;
    console.error('Page render failed', error);
    const currentMain = root.querySelector('#main');
    if (currentMain) {
      currentMain.innerHTML = `<div class="page">${errorPanel(error.message || 'This page could not be loaded.')}
        <div class="row" style="margin-top:16px">
          <button class="btn btn-primary" type="button" data-retry>${icon('refresh', 16)} Try again</button>
          <a class="btn btn-outline" href="${homeForRole(auth.getUser())}">Go to my workspace</a>
        </div></div>`;
      currentMain.querySelector('[data-retry]')?.addEventListener('click', () => renderUrl(new URL(window.location.href)));
    }
  }
}

export function navigate(url, { replace = false } = {}) {
  return renderUrl(url, { replace });
}

function shouldIntercept(anchor, event) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return false;
  if (anchor.dataset.noSpa !== undefined) return false;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') && href !== '#') return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
  const url = new URL(anchor.href, window.location.origin);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/assets/')) return false;
  if (url.pathname.match(/\.(pdf|png|jpe?g|webp|svg|zip)$/i)) return false;
  return true;
}

function handleDocumentClick(event) {
  const anchor = event.target.closest('a[href]');
  if (!shouldIntercept(anchor, event)) return;
  const url = new URL(anchor.href, window.location.origin);
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.replaceState({}, '', fullPath(url));
      return;
    }
  }
  if (url.href === window.location.href) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  event.preventDefault();
  navigate(url);
}

export function startRouter() {
  root = document.getElementById('app');
  document.addEventListener('click', handleDocumentClick);
  window.addEventListener('popstate', () => {
    renderUrl(new URL(window.location.href), { initial: true });
  });
  window.addEventListener('nl:navigate', (event) => {
    const { url, replace } = event.detail || {};
    if (url) navigate(url, { replace });
  });
  const initialUrl = normalizeIndexPath(new URL(window.location.href));
  if (initialUrl.href !== window.location.href) {
    history.replaceState({}, '', fullPath(initialUrl));
  }
  return renderUrl(initialUrl, { initial: true });
}

export function currentPath() {
  return window.location.pathname;
}

export { esc };
