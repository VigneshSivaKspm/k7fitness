/**
 * LIFO stack of "close" handlers for open overlays (dialogs, drawer, menus).
 * The Android back button closes the top-most overlay before it navigates.
 */
const handlers = [];

export function pushBackHandler(fn) {
  handlers.push(fn);
  return () => {
    const i = handlers.lastIndexOf(fn);
    if (i >= 0) handlers.splice(i, 1);
  };
}

/** Runs the top-most handler. Returns false when no overlay is open. */
export function runBackHandler() {
  const fn = handlers[handlers.length - 1];
  if (!fn) return false;
  fn();
  return true;
}
