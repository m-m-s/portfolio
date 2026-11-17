let lastRun = 0;

/**
 * Runs a DOM change as a view transition scoped by a data attribute on <html>
 * (e.g. data-photo-motion="grow"), which the CSS uses to pick what moves. With
 * reduced motion or no View Transitions support, the change just happens.
 */
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
