import { api } from '../api.js';
import { auth } from '../auth.js';
import { icon } from '../icons.js';
import { navigate } from '../router.js';
import { homeForRole } from '../roles.js';
import {
  clearFieldErrors, esc, passwordToggle, setBusy, showFieldErrors, toast
} from '../ui.js';

const ADMIN_DEMO_CODE = 'NABHA-ADMIN';

function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null;
}

function aside(mode) {
  const isRegister = mode === 'register';
  return `<aside class="auth-aside">
    <a class="brand" href="/" aria-label="NabhaLearn home">
      <span class="brand-mark" aria-hidden="true">NL</span>
      <span class="brand-text"><strong>NabhaLearn</strong><small>Learn Beyond Books</small></span>
    </a>
    <div class="auth-aside-inner">
      <div class="auth-aside-copy">
        <span class="hero-badge" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.16);color:#d9ffef">
          <span class="icon-tile">${icon('leaf', 14)}</span> Learning for every child in Nabha
        </span>
        <h2>${isRegister ? 'One platform. Three ways to belong.' : 'Welcome back. Your next lesson is waiting.'}</h2>
        <p>${isRegister
          ? 'Students learn at their own pace, teachers guide classes, and administrators keep the whole school moving — all from one account.'
          : 'Students continue their lessons, teachers open their workspace, and administrators land in the school overview.'}</p>
        <ul class="auth-checks">
          <li>${icon('check-circle', 17)} Short lessons for Classes 6 to 10</li>
          <li>${icon('check-circle', 17)} Teacher tools for assignments and reviews</li>
          <li>${icon('check-circle', 17)} An admin view of people, classes and activity</li>
          <li>${icon('check-circle', 17)} Progress based only on real activity</li>
        </ul>
      </div>
      <div class="auth-role-strip" aria-hidden="true">
        <span>${icon('graduation', 15)} Student</span>
        <span>${icon('users', 15)} Teacher</span>
        <span>${icon('shield', 15)} Admin</span>
      </div>
    </div>
    <div class="auth-quote">
      “Small steps, repeated honestly, become real progress.”
      <strong>NabhaLearn</strong>
    </div>
  </aside>`;
}

function demoButton({ role, iconName, title, email, password }) {
  return `<button type="button" class="demo-option" data-demo-fill="${role}">
    ${icon(iconName, 15)}
    <span><strong>${title}</strong><small>${email} · ${password}</small></span>
  </button>`;
}

function loginForm() {
  return `<form class="auth-form" id="login-form" novalidate>
    <div class="demo-hint">
      ${icon('sparkles', 17)}
      <div><strong>Try a demo account</strong>
        <div class="demo-options">
          ${demoButton({ role: 'student', iconName: 'graduation', title: 'Student', email: 'student@nabhaleam.local', password: 'Student@12345' })}
          ${demoButton({ role: 'teacher', iconName: 'users', title: 'Teacher', email: 'teacher@nabhaleam.local', password: 'Teacher@12345' })}
          ${demoButton({ role: 'admin', iconName: 'shield', title: 'Admin', email: 'admin@nabhaleam.local', password: 'Admin@12345' })}
        </div>
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

function roleOption({ role, iconName, title, text, checked = false }) {
  return `<label class="role-option ${checked ? 'active' : ''}">
    <input type="radio" name="role" value="${role}" ${checked ? 'checked' : ''}>
    <span class="role-icon">${icon(iconName, 18)}</span>
    <span class="role-copy"><strong>${title}</strong><small>${text}</small></span>
  </label>`;
}

function registerForm() {
  return `<form class="auth-form" id="register-form" novalidate>
    <div class="role-picker" role="radiogroup" aria-label="Choose account type">
      ${roleOption({ role: 'STUDENT', iconName: 'graduation', title: 'Student', text: 'Learn and submit work', checked: true })}
      ${roleOption({ role: 'TEACHER', iconName: 'users', title: 'Teacher', text: 'Guide classes' })}
      ${roleOption({ role: 'ADMIN', iconName: 'shield', title: 'Admin', text: 'Run the school' })}
    </div>
    <div class="form-row" id="register-role-row">
      <div class="field">
        <label for="register-name">Full name</label>
        <input class="input" id="register-name" name="fullName" type="text" autocomplete="name" required minlength="2" maxlength="80" placeholder="e.g. Simran Kaur">
      </div>
      <div class="field" data-role-field="STUDENT">
        <label for="register-class">Class</label>
        <select class="select" id="register-class" name="classId" required>
          <option value="">Choose class</option>
          ${[6, 7, 8, 9, 10].map((level) => `<option value="class-${level}">Class ${level}</option>`).join('')}
        </select>
      </div>
      <div class="field" data-role-field="TEACHER" hidden>
        <label for="register-degree">Teaching degree</label>
        <input class="input" id="register-degree" name="degree" type="text" maxlength="120" placeholder="e.g. B.Ed., M.Sc., M.A.">
        <span class="hint">Add the qualification you teach with.</span>
      </div>
      <div class="field" data-role-field="ADMIN" hidden>
        <label for="register-admin-code">Admin invite code</label>
        <input class="input" id="register-admin-code" name="adminCode" type="text" maxlength="80" placeholder="Enter invite code" autocomplete="off">
        <span class="hint">Demo code: <code>${ADMIN_DEMO_CODE}</code></span>
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
    <label class="check" style="margin:4px 0 14px">
      <input type="checkbox" name="terms" required>
      <span>I agree to the <a href="/terms" target="_blank" rel="noopener">terms of use</a> and <a href="/privacy" target="_blank" rel="noopener">privacy policy</a>.</span>
    </label>
    <button class="btn btn-primary btn-block btn-lg" type="submit">Create my free account ${icon('arrow-right', 17)}</button>
  </form>`;
}

export async function render(ctx) {
  const mode = ctx.path === '/register' ? 'register' : 'login';
  return `<div class="auth-page">
    ${aside(mode)}
    <div class="auth-main">
      <div class="auth-card">
        <div class="auth-topline">
          <a class="auth-back" href="/">${icon('arrow-left', 14)} Back to home</a>
          <span class="auth-secure">${icon('lock', 13)} Safe &amp; secure</span>
        </div>
        <div class="auth-mobile-brand">
          <span class="brand-mark" aria-hidden="true">NL</span>
          <span class="brand-text"><strong>NabhaLearn</strong><small>Learn Beyond Books</small></span>
        </div>
        <header class="auth-head">
          <span class="auth-kicker">Student · Teacher · Admin</span>
          <h1>${mode === 'register' ? 'Create your account' : 'Welcome back'}</h1>
          <p>${mode === 'register'
            ? 'Choose your role, then set up your account in under a minute. Each role opens its own workspace.'
            : 'Sign in and we will open the right workspace for your role.'}</p>
        </header>
        ${mode === 'register' ? registerForm() : loginForm()}
        <div class="auth-divider"><span>or</span></div>
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
    const demos = {
      student: { email: 'student@nabhaleam.local', password: 'Student@12345', label: 'student' },
      teacher: { email: 'teacher@nabhaleam.local', password: 'Teacher@12345', label: 'teacher' },
      admin: { email: 'admin@nabhaleam.local', password: 'Admin@12345', label: 'admin' }
    };
    form.querySelectorAll('[data-demo-fill]').forEach((button) => {
      button.addEventListener('click', () => {
        const demo = demos[button.dataset.demoFill] || demos.student;
        form.elements.email.value = demo.email;
        form.elements.password.value = demo.password;
        form.elements.email.focus();
        toast(`Demo ${demo.label} details filled in.`, 'info');
      });
    });
  }

  if (mode === 'register') {
    const syncRole = () => {
      const role = form.querySelector('input[name="role"]:checked')?.value || 'STUDENT';
      form.querySelectorAll('[data-role-field]').forEach((field) => {
        const visible = field.dataset.roleField === role;
        field.hidden = !visible;
        field.querySelectorAll('input, select').forEach((control) => {
          control.required = visible;
        });
      });
      form.querySelectorAll('.role-option').forEach((option) => {
        option.classList.toggle('active', Boolean(option.querySelector('input')?.checked));
      });
    };
    form.querySelectorAll('input[name="role"]').forEach((input) => input.addEventListener('change', syncRole));
    syncRole();
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
        const result = await auth.login(email, password);
        toast('Signed in. Welcome back!', 'success');
        const home = homeForRole(result.user);
        const target = next || home;
        navigate(target);
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
    const role = field('role') || 'STUDENT';
    const errors = {};
    if (field('fullName').trim().length < 2) errors.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field('email').trim())) errors.email = 'Enter a valid email address.';
    if (role === 'STUDENT' && !field('classId')) errors.classId = 'Choose your class.';
    if (role === 'TEACHER' && field('degree').trim().length < 2) errors.degree = 'Add your teaching degree or qualification.';
    if (role === 'ADMIN' && !field('adminCode').trim()) errors.adminCode = 'Enter the admin invite code.';
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
      const result = await auth.register({
        fullName: field('fullName').trim(),
        email: field('email').trim(),
        password,
        confirmPassword,
        role,
        classId: role === 'STUDENT' ? field('classId') : null,
        degree: role === 'TEACHER' ? field('degree').trim() : null,
        adminCode: role === 'ADMIN' ? field('adminCode').trim() : null,
        schoolName: field('schoolName').trim() || null,
        preferredLanguage: field('preferredLanguage') || 'en'
      });
      toast('Your account is ready. Welcome to NabhaLearn!', 'success');
      navigate(homeForRole(result.user || { role }));
    } catch (error) {
      if (error.name === 'AbortError') return;
      showFieldErrors(form, error.errors || {}, error.message);
      toast(error.message, 'error');
    } finally {
      setBusy(button, false);
    }
  });

  const first = form.querySelector('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select');
  if (first) setTimeout(() => first.focus(), 30);
}
