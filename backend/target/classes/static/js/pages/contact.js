import { api } from '../api.js';
import { icon } from '../icons.js';
import {
  clearFieldErrors, esc, iconTile, setBusy, showFieldErrors, toast
} from '../ui.js';

export async function render() {
  return `<section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="/">Home</a>${icon('chevron-right', 11)}<span>Contact</span></div>
      <span class="eyebrow">Contact</span>
      <h1>Tell us what would help you learn</h1>
      <p>Questions about a lesson, a problem with your account, or an idea for the platform? Send a message below.</p>
    </div>
  </section>

  <section class="container contact-grid">
    <div class="contact-form-card">
      <h2>Send a message</h2>
      <p>Fields marked with an asterisk are required. Your message is stored for the project team to review.</p>
      <form class="contact-form" id="contact-form" novalidate>
        <div class="form-row">
          <div class="field">
            <label for="contact-name">Your name *</label>
            <input class="input" id="contact-name" name="name" type="text" autocomplete="name" maxlength="80" required placeholder="e.g. Simran Kaur">
          </div>
          <div class="field">
            <label for="contact-email">Email address *</label>
            <input class="input" id="contact-email" name="email" type="email" autocomplete="email" maxlength="160" required placeholder="you@example.com">
          </div>
        </div>
        <div class="field">
          <label for="contact-topic">What is this about?</label>
          <select class="select" id="contact-topic" name="topic">
            <option value="General">General question</option>
            <option value="Learning">A lesson or quiz</option>
            <option value="Account">My account</option>
            <option value="Feedback">Feedback or suggestion</option>
            <option value="Partnership">School or partnership</option>
            <option value="Other">Something else</option>
          </select>
        </div>
        <div class="field">
          <label for="contact-subject">Subject *</label>
          <input class="input" id="contact-subject" name="subject" type="text" maxlength="120" required placeholder="A short summary">
        </div>
        <div class="field">
          <label for="contact-message">Message *</label>
          <textarea class="textarea" id="contact-message" name="message" maxlength="2000" required placeholder="Write at least 10 characters so we can understand your question."></textarea>
          <div class="hint"><span data-count>0</span>/2000 characters</div>
        </div>
        <div class="field" aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden">
          <label for="contact-website">Website</label>
          <input id="contact-website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <button class="btn btn-primary" type="submit">Send message ${icon('send', 16)}</button>
      </form>
      <div id="contact-success" class="alert-banner" style="display:none;margin-top:18px">
        ${icon('check-circle', 18)}
        <div><strong>Message received.</strong> Thank you — the project team can now review it. No automatic reply is sent in this demo.</div>
      </div>
    </div>

    <aside class="contact-side">
      <div class="contact-info-card">
        <h3>Other ways to get help</h3>
        <div class="contact-info-item">
          ${iconTile('life-buoy', '#0E9F6E')}
          <div><strong>Account help</strong><span>Sign in first, then use Settings to change your password or profile. If you are locked out, send a message here.</span></div>
        </div>
        <div class="contact-info-item">
          ${iconTile('book-open', '#4F7DF3')}
          <div><strong>Learning questions</strong><span>Ask your teacher about syllabus doubts. For platform problems, include the subject and topic name.</span></div>
        </div>
        <div class="contact-info-item">
          ${iconTile('map-pin', '#8367E8')}
          <div><strong>Where we work</strong><span>Designed around the learning needs of rural students in Nabha, Punjab, India.</span></div>
        </div>
      </div>
      <div class="contact-note">
        <strong>About this form.</strong> This is a demonstration deployment. Messages are stored in the demo database and there is no staffed support inbox or phone line. Please do not send sensitive personal information.
      </div>
    </aside>
  </section>`;
}

export async function mount(ctx) {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const message = form.querySelector('[name="message"]');
  const count = form.querySelector('[data-count]');
  message?.addEventListener('input', () => {
    count.textContent = String(message.value.length);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    const button = form.querySelector('button[type="submit"]');
    const field = (name) => form.elements.namedItem(name)?.value ?? '';
    const values = {
      name: field('name').trim(),
      email: field('email').trim(),
      topic: field('topic'),
      subject: field('subject').trim(),
      message: field('message').trim(),
      website: field('website')
    };
    const errors = {};
    if (values.name.length < 2) errors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) errors.email = 'Enter a valid email address.';
    if (values.subject.length < 3) errors.subject = 'Add a short subject.';
    if (values.message.length < 10) errors.message = 'Please write at least 10 characters.';
    if (Object.keys(errors).length) {
      showFieldErrors(form, errors);
      return;
    }
    setBusy(button, true, 'Sending…');
    try {
      const { message: successMessage } = await api.post('/api/contact', values, { signal: ctx.signal });
      toast(successMessage || 'Thank you for your message.', 'success');
      form.reset();
      if (count) count.textContent = '0';
      const success = document.getElementById('contact-success');
      if (success) success.style.display = 'flex';
    } catch (error) {
      if (error.name === 'AbortError') return;
      showFieldErrors(form, error.errors || {}, error.message);
      toast(error.message, 'error');
    } finally {
      setBusy(button, false);
    }
  });
}
