// YouTube Shorts Hider
//
// YouTube is a single-page app: it swaps content in and out of the DOM
// without full page reloads, and it recycles renderer elements (the same
// element can show a Short, then later a regular video). So this script:
//   1. Injects a stylesheet that hides Shorts containers. The browser keeps
//      CSS in sync with the DOM by itself, so a recycled element shows again
//      as soon as it no longer holds a Short, and there is no per-mutation
//      query work.
//   2. Marks the sidebar "Shorts" entry and channel-page "Shorts" tab by
//      matching their visible label, since they don't have a dedicated
//      attribute to select on. This re-runs on DOM mutations (throttled) and
//      on YouTube's own SPA navigation event, and unmarks recycled elements.

const HIDDEN_ATTR = 'data-social-feed-hider-hidden';

// Relative links only: links typed into comments or descriptions are
// absolute (https://www.youtube.com/shorts/...), so they aren't matched.
const SHORTS_LINK = 'a[href^="/shorts/"]';

// Each selector becomes its own CSS rule, so one the browser doesn't support
// can't invalidate the others. If YouTube renames things, update this list.
const SHORTS_SELECTORS = [
  'ytd-rich-shelf-renderer[is-shorts]',   // "Shorts" shelf on Home
  'ytd-reel-shelf-renderer',              // Shorts shelf (older layout)
  'ytd-reel-item-renderer',               // individual Shorts item in a shelf
  'ytm-shorts-lockup-view-model',         // Shorts thumbnail (newer layout)
  'ytd-rich-item-renderer:has(ytm-shorts-lockup-view-model)',
  // Individual video items (Home, search, subscriptions, watch sidebar)
  // that link to a Short.
  `ytd-rich-item-renderer:has(${SHORTS_LINK})`,
  `ytd-video-renderer:has(${SHORTS_LINK})`,
  `ytd-grid-video-renderer:has(${SHORTS_LINK})`,
  `ytd-compact-video-renderer:has(${SHORTS_LINK})`,
  // Any remaining Shorts link outside comments and descriptions.
  `${SHORTS_LINK}:not(#comments a):not(#description a)`,
  // Elements marked by label below.
  `[${HIDDEN_ATTR}]`,
];

// Visible labels of the sidebar entry and channel tab. Add your UI
// language's label here if YouTube translates "Shorts" for you.
const SHORTS_LABELS = new Set(['Shorts']);

const LABELED_SELECTOR =
  'ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ' + // left nav, expanded and mini
  'yt-tab-shape, tp-yt-paper-tab';                               // channel page tabs

function labelOf(el) {
  return (el.getAttribute('aria-label') || el.textContent || '').trim();
}

function markLabeledShorts() {
  document.querySelectorAll(LABELED_SELECTOR).forEach((el) => {
    el.toggleAttribute(HIDDEN_ATTR, SHORTS_LABELS.has(labelOf(el)));
  });
}

// Throttle to one run per animation frame, no matter how many DOM
// mutations fire in between — YouTube's infinite scroll can be chatty.
let scheduled = false;
function scheduleMark() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    markLabeledShorts();
  });
}

const style = document.createElement('style');
style.textContent = SHORTS_SELECTORS
  .map((selector) => `${selector} { display: none !important; }`)
  .join('\n');
// At document_start <head> doesn't exist yet; <html> works just as well.
document.documentElement.append(style);

markLabeledShorts();

const observer = new MutationObserver(scheduleMark);
observer.observe(document.documentElement, { childList: true, subtree: true });

// Fired by YouTube itself after an in-app (SPA) navigation finishes.
document.addEventListener('yt-navigate-finish', scheduleMark);
