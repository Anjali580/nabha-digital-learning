import { api } from '../api.js';
import { auth } from '../auth.js';
import { icon } from '../icons.js';
import { navigate } from '../router.js';
import {
  clearFieldErrors, esc, passwordToggle, setBusy, showFieldErrors, toast
} from '../ui.js';

function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/app/dashboard';
}

function aside(mode) {
  const isRegister = mode === 'register';
  return `<aside class="auth-aside">
    <a class="brand" href="/" aria-label="NabhaLearn home">
      <span class="brand-mark" aria-hidden="true">NL</span>
      <span class="brand-text"><strong>NabhaLearn</strong><small>Learn Beyond Books</small></span>
    </a>
    <div class="auth-aside-copy">
      <span class="hero-badge" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.16);color:#d9ffef">
        <span class="icon-tile">${icon('leaf', 14)}</span> Learning for every child in Nabha
      </span>
      <h2>${isRegister ? 'One small account. A whole year of learning.' : 'Welcome back. Your next lesson is waiting.'}</h2>
      <p>${isRegister
        ? 'Join your class, keep your progress in one place and move at a pace that fits your day.'
        : 'Pick up exactly where you left off, check your progress, and keep building understanding one topic at a time.'}</p>
      <ul class="auth-checks">
        <li>${icon('check-circle', 17)} Short lessons for Classes 6 to 10</li>
        <li>${icon('check-circle', 17)} Quizzes with explanations, not just marks</li>
        <li>${icon('check-circle', 17)} Assignments you can submit from your phone</li>
        <li>${icon('check-circle', 17)} Progress based only on your real activity</li>
      </ul>
    </div>
    <div class="auth-quote">
      “Small steps, repeated honestly, become real progress.”
      <strong>NabhaLearn</strong>
    </div>
  </aside>`;
}

function loginForm() {
  return `<form class="auth-form" id="login-form" novalidate>
    <div class="demo-hint">
      ${icon('sparkles', 17)}
      <div><strong>Try the demo student</strong><br>
        <code>student@nabhaleam.local</code><br><code>Student@12345</code>
        <button type="button" class="btn btn-soft btn-sm" style="margin-top:8px;min-height:32px;padding:5px 12px" data-demo-fill>Fill demo details</button>
      </div>
    </div>
    <div class="field">
      <label for="login-email">Email address</label>
      <input class="input" id="login-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" maxlength="160">
    </div>
    <div class="field">
      <label for="login-password">Password</label>
      <div class="password-wrap">
        <input class="input" id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="Your password">
        <button class="password-toggle" type="button" data-password-toggle aria-label="Show password">${icon('eye', 18)}</button>
      </div>
    </div>
    <button class="btn btn-primary btn-block btn-lg" type="submit">Sign in ${icon('arrow-right', 17)}</button>
  </form>`;
}

function registerForm() {
  return `<form class="auth-form" id="register-form" novalidate>
    <div class="form-row">
      <div class="field">
        <label for="register-name">Full name</label>
        <input class="input" id="register-name" name="fullName" type="text" autocomplete="name" required minlength="2" maxlength="80" placeholder="e.g. Simran Kaur">
      </div>
      <div class="field">
        <label for="register-class">Class</label>
        <select class="select" id="register-class" name="classId" required>
          <option value="">Choose class</option>
          ${[6, 7, 8, 9, 10].map((level) => `<option value="class-${level}">Class ${level}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="field">
      <label for="register-email">Email address</label>
      <input class="input" id="register-email" name="email" type="email" autocomplete="email" required maxlength="160" placeholder="you@example.com">
    </div>
    <div class="field">
      <label for="register-school">School name <span class="optional">(optional)</span></label>
      <input class="input" id="register-school" name="schoolName" type="text" autocomplete="organization" maxlength="120" placeholder="Your school or village school">
    </div>
    <div class="form-row">
      <div class="field">
        <label for="register-password">Password</label>
        <div class="password-wrap">
          <input class="input" id="register-password" name="password" type="password" autocomplete="new-password" required minlength="8" maxlength="72" placeholder="At least 8 characters">
          <button class="password-toggle" type="button" data-password-toggle aria-label="Show password">${icon('eye', 18)}</button>
        </div>
      </div>
      <div class="field">
        <label for="register-confirm">Confirm password</label>
        <div class="password-wrap">
          <input class="input" id="register-confirm" name="confirmPassword" type="password" autocomplete="new-password" required placeholder="Repeat password">
          <button class="password-toggle" type="button" data-password-toggle aria-label="Show password">${icon('eye', 18)}</button>
        </div>
      </div>
    </div>
    <div class="field">
      <label for="register-language">Preferred language</label>
      <select class="select" id="register-language" name="preferredLanguage">
        <option value="en">English</option>
        <option value="hi">हिन्दी (Hindi)</option>
        <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
      </select>
    </div>
    <label class="check" style="margin:6px 0 14px">
      <input type="checkbox" name="terms" required>
      <span>I agree to the <a href="/terms" target="_blank" rel="noopener">terms of use</a> and <a href="/privacy" target="_blank" rel="noopener">privacy policy</a>.</span>
    </label>
    <button class="btn btn-primary btn-block btn-lg" type="submit">Create my free account ${icon('arrow-right', 17)}</button>
  </form>`;
}

export async function render(ctx) {
  const mode = ctx.path === '/register' ? 'register' : 'login';
  const next = ctx.query.get('next') || '';
  return `<div class="auth-page">
    ${aside(mode)}
    <div class="auth-main">
      <div class="auth-card">
        <a class="auth-back" href="/">${icon('arrow-left', 14)} Back to home</a>
        <div class="auth-mobile-brand">
          <span class="brand-mark" aria-hidden="true">NL</span>
          <span class="brand-text"><strong>NabhaLearn</strong><small>Learn Beyond Books</small></span>
        </div>
        <h1>${mode === 'register' ? 'Create your account' : 'Welcome back'}</h1>
        <p>${mode === 'register'
          ? 'It takes less than a minute. Choose your class and start learning for free.'
          : 'Sign in to continue your lessons, quizzes and assignments.'}</p>
        ${mode === 'register' ? registerForm() : loginForm()}
        <div class="auth-divider">or</div>
        <p class="auth-switch">${mode === 'register'
          ? 'Already have an account? <a href="/login">Sign in</a>'
          : 'New to NabhaLearn? <a href="/register">Create a free account</a>'}</p>
        <p class="auth-terms">By continuing you agree to our <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>. This is a demonstration platform.</p>
      </div>
    </div>
  </div>`;
}

export async function mount(ctx) {
  const mode = ctx.path === '/register' ? 'register' : 'login';
  const form = document.getElementById(mode === 'register' ? 'register-form' : 'login-form');
  if (!form) return;
  const next = safeNext(ctx.query.get('next'));

  form.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => passwordToggle(button));
  });

  if (mode === 'login') {
    form.querySelector('[data-demo-fill]')?.addEventListener('click', () => {
      form.elements.email.value = 'student@nabhaleam.local';
      form.elements.password.value = 'Student@12345';
      form.elements.email.focus();
    });
  }

  try {
    const { data: classes } = await api.get('/api/classes', { signal: ctx.signal });
    const select = form.querySelector('[name="classId"]');
    if (select && Array.isArray(classes) && classes.length) {
      select.innerHTML = '<option value="">Choose class</option>' +
        classes.map((item) => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
    }
  } catch (error) {
    if (error.name !== 'AbortError') console.warn('Classes could not load', error.message);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    const button = form.querySelector('button[type="submit"]');
    const field = (name) => form.elements.namedItem(name)?.value ?? '';

    if (mode === 'login') {
      const email = field('email').trim();
      const password = field('password');
      const errors = {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email address.';
      if (!password) errors.password = 'Enter your password.';
      if (Object.keys(errors).length) {
        showFieldErrors(form, errors);
        return;
      }
      setBusy(button, true, 'Signing in…');
      try {
        await auth.login(email, password);
        toast('Signed in. Welcome back!', 'success');
        navigate(next);
      } catch (error) {
        if (error.name === 'AbortError') return;
        showFieldErrors(form, error.errors || {}, error.message);
        toast(error.message, 'error');
      } finally {
        setBusy(button, false);
      }
      return;
    }

    const password = field('password');
    const confirmPassword = field('confirmPassword');
    const errors = {};
    if (field('fullName').trim().length < 2) errors.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field('email').trim())) errors.email = 'Enter a valid email address.';
    if (!field('classId')) errors.classId = 'Choose your class.';
    if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (!form.elements.namedItem('terms')?.checked) errors.terms = 'Please accept the terms to continue.';
    if (Object.keys(errors).length) {
      showFieldErrors(form, errors);
      if (errors.terms) toast('Please accept the terms to create your account.', 'error');
      return;
    }
    setBusy(button, true, 'Creating account…');
    try {
      await auth.register({
        fullName: field('fullName').trim(),
        email: field('email').trim(),
        password,
        confirmPassword,
        classId: field('classId'),
        schoolName: field('schoolName').trim() || null,
        preferredLanguage: field('preferredLanguage') || 'en'
      });
      toast('Your account is ready. Welcome to NabhaLearn!', 'success');
      navigate('/app/dashboard');
    } catch (error) {
      if (error.name === 'AbortError') return;
      showFieldErrors(form, error.errors || {}, error.message);
      toast(error.message, 'error');
    } finally {
      setBusy(button, false);
    }
  });

  const first = form.querySelector('input, select');
  if (first) setTimeout(() => first.focus(), 30);
}
