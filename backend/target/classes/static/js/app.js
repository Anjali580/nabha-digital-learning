import { auth } from './auth.js';
import { navigate, startRouter } from './router.js';
import { toast } from './ui.js';

async function boot() {
  try {
    await auth.loadSession();
  } catch (error) {
    console.error('Session boot failed', error);
  }

  auth.onAuthChange((state) => {
    if (!state.user && window.location.pathname.startsWith('/app')) {
      const next = window.location.pathname + window.location.search;
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
    }
  });

  await startRouter();

  window.addEventListener('offline', () => {
    toast('You are offline. Pages that are already open still work, but new lessons need a connection.', 'info', 5200);
  });
  window.addEventListener('online', () => {
    toast('Back online. You can continue learning.', 'success');
  });
}

boot().catch((error) => {
  console.error('Could not start NabhaLearn', error);
  const root = document.getElementById('app');
  if (root) {
    root.innerHTML = `<div class="boot-screen" style="padding:24px;text-align:center">
      <div class="boot-mark">NL</div>
      <h1 style="font-size:1.4rem">NabhaLearn could not start</h1>
      <p style="max-width:420px">Please check your connection and reload the page. If the problem continues, the learning server may be offline.</p>
      <button class="btn btn-primary" onclick="window.location.reload()">Reload page</button>
    </div>`;
  }
});
