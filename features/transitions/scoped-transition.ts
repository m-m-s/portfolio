let lastRun = 0;

export function scopedTransition(
  attribute: string,
  kind: string,
  update: () => void,
  done = () => {},
) {
  if (
    !document.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    done();
    return;
  }
  const root = document.documentElement;
  const run = ++lastRun;
  root.dataset[attribute] = kind;
  document.startViewTransition(update).finished.finally(() => {
    // A newer transition may already be running under the same attribute.
    if (run === lastRun) delete root.dataset[attribute];
    done();
  });
}
