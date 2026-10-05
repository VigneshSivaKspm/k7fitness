const EVENT = 'k7:select-interest';

/** Lets any "Get started" button pre-fill the enquiry form's interest field. */
export function selectInterest(value) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function onInterestSelected(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
