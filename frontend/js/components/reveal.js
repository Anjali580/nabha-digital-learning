/**
 * Scroll reveal for the public landing page.
 *
 * Elements marked with `data-reveal` fade and rise into place the first time
 * they enter the viewport. The hidden state lives behind an `html.reveal-ready`
 * class that this module adds, so if the script ever fails the content is still
 * visible — the animation is an enhancement, never a requirement.
 *
 * Optional stagger: `style="--reveal-delay:120ms"`.
 */

export function createReveal({ signal } = {}) {
  const seen = new WeakSet();
  const supported = 'IntersectionObserver' in window;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let observer = null;

  if (supported && !reduced) {
    document.documentElement.classList.add('reveal-ready');
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  }

  function scan(root = document) {
    const nodes = root.querySelectorAll('[data-reveal]');
    for (const node of nodes) {
      if (seen.has(node)) continue;
      seen.add(node);
      if (observer) observer.observe(node);
      else node.classList.add('is-revealed');
    }
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    document.documentElement.classList.remove('reveal-ready');
  }

  signal?.addEventListener('abort', stop, { once: true });

  return { scan, stop };
}
