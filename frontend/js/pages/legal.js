import { icon } from '../icons.js';
import { esc } from '../ui.js';

const PRIVACY = {
  title: 'Privacy policy',
  intro: 'This policy explains what NabhaLearn stores, why it is needed, and the choices you have. It applies to this demonstration deployment.',
  sections: [
    ['What we collect', `<p>When you create an account we store your full name, email address, class, optional school name and preferred language. We also store a secure password hash — never your plain password.</p>
      <p>As you learn, we store the topics you open and complete, quiz attempts and answers, assignment submissions and files you upload, bookmarks, preferences and notifications. These records make your dashboard, progress and feedback work.</p>`],
    ['Why we use it', `<p>Your data is used only to provide the learning service: showing your lessons, calculating your progress, evaluating quizzes, storing submissions for review, and displaying your own notifications.</p>
      <p>We do not sell personal data, build advertising profiles or share your records with other students. In this demo deployment there are no third-party analytics scripts.</p>`],
    ['How it is protected', `<ul>
      <li>Passwords are hashed with BCrypt and are never returned by the API.</li>
      <li>Sessions use a signed JWT in an HttpOnly, SameSite cookie that JavaScript cannot read.</li>
      <li>State-changing requests require an additional client-verification header.</li>
      <li>Every student resource is checked against the signed-in student. Another student’s assignment or file is not accessible.</li>
      <li>Uploads are limited to 5 MB and checked by content type and file signature.</li>
    </ul>`],
    ['Storage and retention', `<p>Account, progress and submission data are stored in the MongoDB database configured for this deployment. Uploaded files are stored in the configured uploads directory. Demo data may be reset by the project team.</p>
      <p>For a real deployment, the operating school or organisation would set a retention period and delete accounts and submissions when they are no longer needed. This demo keeps data until the demo database is cleared.</p>`],
    ['Your choices', `<p>You can update your name, email, class, school name and language in Profile, change your password in Settings, and remove bookmarks at any time. Ask the project team through the contact form if you want your demo account and records deleted.</p>`],
    ['Children and school data', `<p>NabhaLearn is intended for school-age learners. This demonstration does not contain real school records or real student data. A production deployment should obtain appropriate consent from the school or guardian and publish clear contact details for privacy requests.</p>`],
    ['Contact', `<p>Use the <a href="/contact">contact form</a> for privacy questions about this demo. Please do not include sensitive personal information in the message.</p>`]
  ]
};

const TERMS = {
  title: 'Terms of use',
  intro: 'These terms describe the rules for using this demonstration version of NabhaLearn. By creating an account or using the site, you agree to them.',
  sections: [
    ['The service', `<p>NabhaLearn provides a digital learning environment with lessons, quizzes, assignments, bookmarks, notifications and progress tracking. This deployment is a demonstration and may be changed, paused or reset without notice.</p>`],
    ['Your account', `<ul>
      <li>Provide accurate information and keep your password private.</li>
      <li>Do not share your account or let another student submit work through it.</li>
      <li>You are responsible for activity performed while signed in to your account.</li>
      <li>Tell the project team through the contact form if you believe your account is compromised.</li>
    </ul>`],
    ['Acceptable use', `<p>Do not upload unlawful, harmful or unrelated files; attempt to access another student’s data; probe or disrupt the service; automate requests in a way that degrades availability; or copy the platform for a commercial service without permission.</p>`],
    ['Learning content', `<p>The lessons, quizzes and explore articles in this demo are sample curriculum content created for the project. They are provided for learning and demonstration. Always check important academic facts with your teacher or official textbook.</p>`],
    ['Your submissions', `<p>You keep ownership of the work you submit. You give the project team permission to store it and, in a real deployment, to show it to the teachers responsible for reviewing your class. Do not upload another person’s work as your own.</p>`],
    ['Availability and accuracy', `<p>The service is provided “as is” for demonstration. We do not guarantee uninterrupted access, a particular mark, or that every lesson is free of errors. Progress calculations depend on the actions recorded in your account.</p>`],
    ['Ending access', `<p>Access may be suspended if these terms are seriously or repeatedly broken, or when the demo is reset. You may stop using the service at any time.</p>`],
    ['Changes and contact', `<p>These terms may be updated as the platform develops. The date below shows the current version. Questions can be sent through the <a href="/contact">contact form</a>.</p>`]
  ]
};

export async function render(ctx) {
  const doc = ctx.path === '/terms' ? TERMS : PRIVACY;
  return `<section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="/">Home</a>${icon('chevron-right', 11)}<span>${esc(doc.title)}</span></div>
      <span class="eyebrow">Legal</span>
      <h1>${esc(doc.title)}</h1>
      <p>${esc(doc.intro)}</p>
      <p class="hint" style="margin-top:14px">Last updated 15 November 2026</p>
    </div>
  </section>
  <div class="container prose-wrap">
    <article class="prose">
      ${doc.sections.map(([heading, body], index) => `<section id="section-${index + 1}">
        <h2>${index + 1}. ${esc(heading)}</h2>
        ${body}
      </section>`).join('')}
      <div class="callout">${icon('info', 18)}<span>This is a demonstration deployment. For a real school rollout, the operating organisation should review these documents with its legal and safeguarding leads.</span></div>
      <p class="hint" style="margin-top:20px"><a href="/contact">Contact the project team</a> · <a href="${doc === PRIVACY ? '/terms' : '/privacy'}">${doc === PRIVACY ? 'Terms of use' : 'Privacy policy'}</a></p>
    </article>
    <nav class="prose-toc" aria-label="On this page">
      <h4>On this page</h4>
      ${doc.sections.map(([heading], index) => `<a href="#section-${index + 1}">${esc(heading)}</a>`).join('')}
    </nav>
  </div>`;
}
