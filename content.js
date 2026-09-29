// YouTube Shorts Hider
//
// YouTube is a single-page app: it swaps content in and out of the DOM
// without full page reloads, and it uses custom element tag names that
// change from time to time. So instead of hiding things once, this script:
//   1. Hides known Shorts containers by tag/attribute (fast, stable-ish).
//   2. Hides anything that contains a link to /shorts/... (catches new UI
//      variants CSS selectors alone would miss).
//   3. Hides the sidebar "Shorts" entry and channel-page "Shorts" tab by
//      matching their visible text, since they don't have a dedicated
//      attribute to select on.
//   4. Re-runs on every DOM mutation (throttled) and on YouTube's own
//      SPA navigation event, so infinite scroll / page changes stay clean.

// Tag names / attributes YouTube currently uses for Shorts containers.
// If YouTube renames these, only this list needs updating.
const SHORTS_CONTAINER_SELECTORS = [
  'ytd-rich-shelf-renderer[is-shorts]',   // "Shorts" shelf on Home
  'ytd-reel-shelf-renderer',              // Shorts shelf (older layout)
  'ytd-reel-item-renderer',               // individual Shorts item in a shelf
  'ytm-shorts-lockup-view-model',         // Shorts thumbnail (newer layout)
  'ytd-rich-item-renderer:has(ytm-shorts-lockup-view-model)',
];

// Ancestor tags worth hiding entirely when they only wrap a Shorts link.
const SHORTS_ITEM_ANCESTORS =
  'ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, ' +
  'ytd-compact-video-renderer, ytd-reel-item-renderer, ' +
  'ytm-shorts-lockup-view-model, ytd-rich-grid-row';

function hide(el) {
  el.style.setProperty('display', 'none', 'important');
}

function hideShorts() {
  // 1. Known containers/attributes.
  for (const selector of SHORTS_CONTAINER_SELECTORS) {
    let matches;
    try {
      matches = document.querySelectorAll(selector);
    } catch (e) {
      continue; // skip selectors the browser's CSS engine doesn't support
    }
    matches.forEach(hide);
  }

  // 2. Any element whose link points at /shorts/.
  document
    .querySelectorAll('a[href^="/shorts/"], a[href*="/shorts/"]')
    .forEach((a) => {
      const container = a.closest(SHORTS_ITEM_ANCESTORS);
      hide(container || a);
    });

  // 3. Sidebar "Shorts" entry (left nav, both expanded and mini/rail forms).
  document
    .querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer')
    .forEach((entry) => {
      const label = (entry.getAttribute('aria-label') || entry.textContent || '').trim();
      if (label === 'Shorts') hide(entry);
    });

  // 4. "Shorts" tab on channel pages.
  document.querySelectorAll('yt-tab-shape, tp-yt-paper-tab').forEach((tab) => {
    if ((tab.textContent || '').trim() === 'Shorts') hide(tab);
  });
}

// Throttle to one run per animation frame, no matter how many DOM
// mutations fire in between — YouTube's infinite scroll can be chatty.
let scheduled = false;
function scheduleHide() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    hideShorts();
  });
}

hideShorts();

const observer = new MutationObserver(scheduleHide);
observer.observe(document.documentElement, { childList: true, subtree: true });

// Fired by YouTube itself after an in-app (SPA) navigation finishes.
document.addEventListener('yt-navigate-finish', scheduleHide);
