/**
 * NabhaLearn — animated backdrop for the public landing page.
 *
 * The hero is built from five stacked layers (back to front):
 *
 *   1. aurora     three large, very slow colour fields      (CSS keyframes)
 *   2. grid       drifting grid lines under a radial mask    (CSS keyframes)
 *   3. canvas     a constellation of drifting "motes"        (this module)
 *   4. float      doodles that react to the pointer + scroll (CSS + this module)
 *   5. spotlight  a soft glow that follows the pointer       (CSS var driven)
 *
 * Rules the module follows so the effect never becomes a problem:
 *   • prefers-reduced-motion → a single static frame, no listeners, no loop.
 *   • coarse pointers / low-core devices → fewer motes, no pointer parallax.
 *   • the loop stops when the hero leaves the viewport or the tab is hidden.
 *   • colours are read from the CSS custom properties, so light/dark themes and
 *     any future palette change are picked up automatically.
 *   • it always returns a cleanup function; the router aborts the page signal on
 *     navigation, which tears down every listener, observer and animation.
 */

const FALLBACKS = {
  brand: '#0e9f6e',
  blue: '#4f7df3',
  violet: '#8367e8',
  amber: '#e9a23b'
};

/* Weighted palette: mostly brand green, a few accents for life. */
const PARTICLE_KEYS = ['brand', 'brand', 'brand', 'brand', 'blue', 'blue', 'violet', 'amber'];
const TWO_PI = Math.PI * 2;
const POINTER_RADIUS = 180;

function toRgb(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;

  if (raw.startsWith('#')) {
    let hex = raw.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length !== 6) return null;
    const num = Number.parseInt(hex, 16);
    if (Number.isNaN(num)) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  const match = raw.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const [r, g, b] = match[1].split(/[\s,/]+/).map(Number);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }

  return null;
}

function readPalette() {
  const styles = getComputedStyle(document.documentElement);
  const pick = (name) => toRgb(styles.getPropertyValue(name)) || toRgb(FALLBACKS[name]);
  return {
    brand: pick('brand'),
    blue: pick('blue'),
    violet: pick('violet'),
    amber: pick('amber')
  };
}

function rgba({ r, g, b }, alpha) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * @param {HTMLElement|null} host  the `.hero-bg` element
 * @param {{ signal?: AbortSignal }} options
 * @returns {() => void} teardown
 */
export function mountLandingBackground(host, { signal } = {}) {
  if (!host) return () => {};

  const canvas = host.querySelector('[data-bg-canvas]');
  const context = canvas?.getContext('2d', { alpha: true });
  const spotlight = host.querySelector('[data-bg-spotlight]');
  const parallaxNodes = Array.from(host.querySelectorAll('[data-parallax]'));
  const hero = host.parentElement || host;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const lite = coarsePointer.matches || (navigator.hardwareConcurrency || 4) <= 4;

  /* Elements that lean towards the pointer. Disabled on touch, where there is
     no cursor to lean towards. */
  const tiltNodes = finePointer.matches ? Array.from(host.querySelectorAll('[data-tilt]')) : [];

  let palette = readPalette();
  let width = 0;
  let height = 0;
  let particles = [];
  let frameId = 0;
  let lastTime = 0;
  let inView = true;
  let disposed = false;

  const pointer = { x: 0.5, y: 0.4, targetX: 0.5, targetY: 0.4, active: false };
  const scroll = { y: 0 };

  /* ------------------------------------------------------------- particles */

  function particleBudget() {
    const area = width * height;
    const density = lite ? 36000 : 19000;
    const cap = lite ? 26 : 64;
    return Math.max(12, Math.min(cap, Math.round(area / density)));
  }

  function seedParticles() {
    const count = particleBudget();
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (lite ? 10 : 16),
      vy: (Math.random() - 0.5) * (lite ? 10 : 16),
      radius: 1.1 + Math.random() * 2.2,
      alpha: 0.22 + Math.random() * 0.4,
      color: PARTICLE_KEYS[(Math.random() * PARTICLE_KEYS.length) | 0],
      phase: Math.random() * TWO_PI,
      twinkle: 0.4 + Math.random() * 1.4
    }));
  }

  /* ---------------------------------------------------------------- sizing */

  function resize() {
    const nextWidth = host.clientWidth;
    const nextHeight = host.clientHeight;
    if (!nextWidth || !nextHeight) return;

    const areaBefore = width * height;
    const areaAfter = nextWidth * nextHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = nextWidth;
    height = nextHeight;

    if (canvas && context) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (!particles.length || areaBefore === 0 || areaAfter / areaBefore > 1.45 || areaAfter / areaBefore < 0.7) {
      seedParticles();
    } else {
      for (const particle of particles) {
        particle.x = Math.min(particle.x, width);
        particle.y = Math.min(particle.y, height);
      }
    }

    if (reduceQuery.matches) draw(performance.now());
  }

  /* --------------------------------------------------------------- drawing */

  function draw(now) {
    if (!context || !width || !height) return;

    context.clearRect(0, 0, width, height);

    const linkDistance = Math.max(86, Math.min(150, Math.sqrt(width * height) / 11));
    const linkSquared = linkDistance * linkDistance;
    const brand = palette.brand;

    /* Connections first so the motes always sit on top of the web. */
    context.lineWidth = 1;
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const squared = dx * dx + dy * dy;
        if (squared > linkSquared) continue;

        const strength = 1 - Math.sqrt(squared) / linkDistance;
        context.strokeStyle = rgba(brand, strength * 0.15);
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }

    for (const particle of particles) {
      const colour = palette[particle.color] || brand;
      const twinkle = 0.68 + 0.32 * Math.sin((now / 1000) * particle.twinkle + particle.phase);
      context.fillStyle = rgba(colour, particle.alpha * twinkle);
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, TWO_PI);
      context.fill();
    }
  }

  /* ------------------------------------------------------------- animation */

  function step(dt) {
    const cursorX = pointer.x * width;
    const cursorY = pointer.y * height;

    for (const particle of particles) {
      if (pointer.active) {
        const dx = particle.x - cursorX;
        const dy = particle.y - cursorY;
        const squared = dx * dx + dy * dy;
        if (squared < POINTER_RADIUS * POINTER_RADIUS && squared > 4) {
          const distance = Math.sqrt(squared);
          const push = (1 - distance / POINTER_RADIUS) * 42 * dt;
          particle.x += (dx / distance) * push;
          particle.y += (dy / distance) * push;
        }
      }

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      if (particle.x < -30) particle.x = width + 30;
      else if (particle.x > width + 30) particle.x = -30;

      if (particle.y < -30) particle.y = height + 30;
      else if (particle.y > height + 30) particle.y = -30;
    }
  }

  function applyParallax(dt) {
    const ease = Math.min(1, dt * 6);
    pointer.x += (pointer.targetX - pointer.x) * ease;
    pointer.y += (pointer.targetY - pointer.y) * ease;

    if (spotlight && width && height) {
      spotlight.style.transform = `translate3d(${(pointer.x * width).toFixed(1)}px, ${(pointer.y * height).toFixed(1)}px, 0)`;
    }

    if (tiltNodes.length) {
      const nx = pointer.x - 0.5;
      const ny = pointer.y - 0.5;
      for (const node of tiltNodes) {
        const strength = Number(node.dataset.tilt) || 5;
        const rotateX = (-ny * strength).toFixed(2);
        const rotateY = (nx * strength).toFixed(2);
        node.style.transform = `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    }

    if (!parallaxNodes.length) return;

    const nx = pointer.x - 0.5;
    const ny = pointer.y - 0.5;

    for (const node of parallaxNodes) {
      const depth = Number(node.dataset.parallax) || 1;
      const x = -nx * 26 * depth;
      const y = -ny * 20 * depth + scroll.y * 0.05 * depth;
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    }
  }

  function tick(now) {
    frameId = requestAnimationFrame(tick);
    if (disposed || !inView || document.hidden || !width || !height) {
      lastTime = now;
      return;
    }

    const delta = lastTime ? Math.min(64, now - lastTime) : 16;
    lastTime = now;
    const dt = delta / 1000;

    step(dt);
    applyParallax(dt);
    draw(now);
  }

  function start() {
    if (disposed || reduceQuery.matches) return;
    if (!frameId) frameId = requestAnimationFrame(tick);
  }

  function stop() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
  }

  /* -------------------------------------------------------------- listeners */

  function onPointerMove(event) {
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.targetX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    pointer.targetY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    pointer.active = true;
  }

  function onPointerLeave() {
    pointer.active = false;
    pointer.targetX = 0.5;
    pointer.targetY = 0.4;
  }

  function onScroll() {
    scroll.y = window.scrollY || window.pageYOffset || 0;
  }

  function onVisibility() {
    if (document.hidden) lastTime = 0;
  }

  function onReduceChange() {
    if (reduceQuery.matches) {
      stop();
      applyParallax(0.2);
      draw(performance.now());
    } else {
      start();
    }
  }

  function onThemeChange() {
    palette = readPalette();
    draw(performance.now());
  }

  const options = signal ? { signal } : undefined;

  if (finePointer.matches) {
    hero.addEventListener('pointermove', onPointerMove, { passive: true, ...(options || {}) });
    hero.addEventListener('pointerleave', onPointerLeave, options);
  }
  window.addEventListener('scroll', onScroll, { passive: true, ...(options || {}) });
  document.addEventListener('visibilitychange', onVisibility, options);

  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => resize()) : null;
  resizeObserver?.observe(host);
  if (!resizeObserver) window.addEventListener('resize', resize, { passive: true, ...(options || {}) });

  const viewObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (inView) lastTime = 0;
    }, { threshold: 0 })
    : null;
  viewObserver?.observe(hero);

  const themeObserver = 'MutationObserver' in window
    ? new MutationObserver(onThemeChange)
    : null;
  themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  reduceQuery.addEventListener?.('change', onReduceChange);

  /* ------------------------------------------------------------------ boot */

  resize();
  applyParallax(0.2);

  if (reduceQuery.matches) {
    draw(performance.now());
  } else {
    start();
  }

  /* --------------------------------------------------------------- teardown */

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    resizeObserver?.disconnect();
    viewObserver?.disconnect();
    themeObserver?.disconnect();
    reduceQuery.removeEventListener?.('change', onReduceChange);
    if (!signal) {
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    }
    particles = [];
    if (context) context.clearRect(0, 0, width, height);
  }

  if (signal?.aborted) dispose();
  else signal?.addEventListener('abort', dispose, { once: true });

  return dispose;
}
