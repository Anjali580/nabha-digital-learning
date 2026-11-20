import { api } from '../api.js';
import { auth } from '../auth.js';
import { icon } from '../icons.js';
import { roleLabel } from '../roles.js';
import {
  avatar, confirmDialog, emptyState, esc, setBusy, timeAgo, toast
} from '../ui.js';

function roleTone(role) {
  if (role === 'ADMIN') return 'blue';
  if (role === 'TEACHER') return 'violet';
  return 'green';
}

function detailFor(person) {
  if (person.role === 'TEACHER') return person.degree || 'Teacher';
  if (person.role === 'ADMIN') return person.schoolName || 'Administrator';
  return person.className || 'No class';
}

function searchText(person) {
  return [
    person.fullName, person.email, person.className,
    person.degree, person.schoolName, roleLabel(person.role)
  ].filter(Boolean).join(' ').toLowerCase();
}

function rowMarkup(person, meId) {
  const self = person.id === meId;
  const next = !person.active;
  const actionLabel = self ? 'You' : next ? 'Activate' : 'Deactivate';
  return `<div class="person-row ${person.active ? '' : 'is-inactive'}" data-person-row>
    <div class="person-main">
      ${avatar({ fullName: person.fullName }, 'sm')}
      <div class="person-id">
        <strong>${esc(person.fullName || 'Unnamed account')}${self ? ' <span class="person-you">You</span>' : ''}</strong>
        <span>${esc(person.email || '')}</span>
      </div>
    </div>
    <div class="person-detail">
      <span class="badge ${roleTone(person.role)}">${esc(roleLabel(person.role))}</span>
      <span class="person-detail-text">${esc(detailFor(person))}</span>
    </div>
    <div class="person-status">
      <span class="status-pill ${person.active ? 'active' : 'inactive'}">
        <i></i>${person.active ? 'Active' : 'Inactive'}
      </span>
      <small>${person.createdAt ? esc(timeAgo(person.createdAt)) : 'New'}</small>
    </div>
    <button class="btn ${next ? 'btn-primary' : 'btn-outline'} btn-sm person-action"
      type="button"
      data-toggle-status="${esc(person.id)}"
      data-next-active="${next}"
      ${self ? 'disabled title="You cannot change your own account status."' : `title="${next ? 'Activate' : 'Deactivate'} this account"`}>
      ${icon(next ? 'check-circle' : 'shield', 14)} ${actionLabel}
    </button>
  </div>`;
}

export async function render(ctx) {
  const { data } = await api.get('/api/admin/users', { signal: ctx.signal });
  const people = data || [];
  ctx.adminUsers = people;

  const counts = {
    ALL: people.length,
    STUDENT: people.filter((person) => person.role === 'STUDENT').length,
    TEACHER: people.filter((person) => person.role === 'TEACHER').length,
    ADMIN: people.filter((person) => person.role === 'ADMIN').length
  };
  const activeCount = people.filter((person) => person.active).length;

  return `<div class="page admin-page">
    <div class="page-head">
      <div>
        <span class="eyebrow">School administration</span>
        <h1>People</h1>
        <p>Every student, teacher and administrator in one place. Search the roster or switch an account on and off.</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-outline btn-sm" href="/app/admin/dashboard">${icon('dashboard', 16)} Overview</a>
        <a class="btn btn-primary btn-sm" href="/app/teacher/students">${icon('users', 16)} Class roster</a>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-tile">
        <span class="icon-tile green">${icon('users', 18)}</span>
        <div><strong>${counts.ALL}</strong><span>Total accounts</span><small>${activeCount} active</small></div>
      </div>
      <div class="stat-tile">
        <span class="icon-tile violet">${icon('graduation', 18)}</span>
        <div><strong>${counts.STUDENT}</strong><span>Students</span><small>Across all classes</small></div>
      </div>
      <div class="stat-tile">
        <span class="icon-tile blue">${icon('school', 18)}</span>
        <div><strong>${counts.TEACHER}</strong><span>Teachers</span><small>Teaching staff</small></div>
      </div>
      <div class="stat-tile">
        <span class="icon-tile amber">${icon('shield', 18)}</span>
        <div><strong>${counts.ADMIN}</strong><span>Admins</span><small>School leaders</small></div>
      </div>
    </div>

    <section class="panel admin-people-panel">
      <div class="panel-body people-toolbar-body">
        <div class="people-toolbar">
          <label class="people-search">
            ${icon('search', 16)}
            <input type="search" data-people-search placeholder="Search name, email, class or school" aria-label="Search people" autocomplete="off">
          </label>
          <div class="people-filters" role="group" aria-label="Filter by role">
            <button type="button" class="filter-chip active" data-role-filter="ALL">All <span>${counts.ALL}</span></button>
            <button type="button" class="filter-chip" data-role-filter="STUDENT">Students <span>${counts.STUDENT}</span></button>
            <button type="button" class="filter-chip" data-role-filter="TEACHER">Teachers <span>${counts.TEACHER}</span></button>
            <button type="button" class="filter-chip" data-role-filter="ADMIN">Admins <span>${counts.ADMIN}</span></button>
          </div>
        </div>
      </div>

      <div class="people-list" data-people-body>
        ${people.map((person) => rowMarkup(person, auth.getUser()?.id)).join('')}
      </div>
      <div class="people-empty" data-people-empty hidden>
        ${emptyState({ iconName: 'search', title: 'No matching people', text: 'Try a different name, role or class.' })}
      </div>

      <div class="people-foot">
        <span data-people-count>Showing ${people.length} account${people.length === 1 ? '' : 's'}</span>
        <span class="people-foot-hint">${icon('info', 13)} Deactivated accounts cannot sign in until they are reactivated.</span>
      </div>
    </section>
  </div>`;
}

export async function mount(ctx) {
  const root = ctx.root || document;
  const people = ctx.adminUsers || [];
  const meId = auth.getUser()?.id;
  const body = root.querySelector('[data-people-body]');
  const empty = root.querySelector('[data-people-empty]');
  const count = root.querySelector('[data-people-count]');
  const search = root.querySelector('[data-people-search]');
  const filters = Array.from(root.querySelectorAll('[data-role-filter]'));
  const state = { query: '', role: 'ALL' };

  const draw = () => {
    const needle = state.query.trim().toLowerCase();
    const visible = people.filter((person) =>
      (state.role === 'ALL' || person.role === state.role) &&
      (!needle || searchText(person).includes(needle)));
    body.innerHTML = visible.map((person) => rowMarkup(person, meId)).join('');
    empty.hidden = visible.length > 0;
    body.hidden = visible.length === 0;
    if (count) {
      count.textContent = visible.length === people.length
        ? `Showing ${visible.length} account${visible.length === 1 ? '' : 's'}`
        : `Showing ${visible.length} of ${people.length} accounts`;
    }
    filters.forEach((button) => {
      button.classList.toggle('active', button.dataset.roleFilter === state.role);
    });
  };

  search?.addEventListener('input', () => {
    state.query = search.value;
    draw();
  });

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      state.role = button.dataset.roleFilter;
      draw();
    });
  });

  body.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-toggle-status]');
    if (!button || button.disabled) return;
    const person = people.find((item) => item.id === button.dataset.toggleStatus);
    if (!person) return;
    const nextActive = button.dataset.nextActive === 'true';
    if (person.id === meId) {
      toast('You cannot change your own account status.', 'error');
      return;
    }
    const ok = await confirmDialog({
      title: nextActive ? 'Activate this account?' : 'Deactivate this account?',
      message: nextActive
        ? `${person.fullName} will be able to sign in again and use NabhaLearn.`
        : `${person.fullName} will be signed out and blocked from signing in until reactivated.`,
      confirmText: nextActive ? 'Activate account' : 'Deactivate account',
      danger: !nextActive
    });
    if (!ok) return;
    setBusy(button, true, nextActive ? 'Activating…' : 'Deactivating…');
    try {
      const { data } = await api.put(`/api/admin/users/${encodeURIComponent(person.id)}/status`, { active: nextActive });
      const updated = data || { ...person, active: nextActive };
      Object.assign(person, updated);
      draw();
      toast(nextActive ? 'Account reactivated.' : 'Account deactivated.', 'success');
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast(error.errors ? Object.values(error.errors).join(' ') : error.message, 'error');
        setBusy(button, false);
      }
    }
  });
}
