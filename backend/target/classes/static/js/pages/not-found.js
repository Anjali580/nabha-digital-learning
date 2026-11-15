import { icon } from '../icons.js';

export async function render() {
  return `<section class="not-found">
    <div>
      <div class="code" aria-hidden="true">404</div>
      <h1>This page took a different path</h1>
      <p>The page you are looking for does not exist, moved, or needs a signed-in account. Let’s get you back to learning.</p>
      <div class="row">
        <a class="btn btn-primary" href="/">Go home ${icon('arrow-right', 16)}</a>
        <a class="btn btn-outline" href="/courses">Browse courses</a>
      </div>
    </div>
  </section>`;
}
