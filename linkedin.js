const HIDDEN_CLASS = 'social-feed-hider-hidden';
const FEED_SELECTORS = [
  'main',
  '[role="main"]',
  '.scaffold-layout__main',
  '.scaffold-finite-scroll',
  '[data-view-name="feed"]',
  '.feed-shared-update-v2',
  '[data-urn^="urn:li:activity"]',
];

function isHomeFeed() {
  return /^\/(?:feed\/?)?$/.test(window.location.pathname);
}

function updateFeedVisibility() {
  if (!isHomeFeed()) {
    document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((element) => {
      element.classList.remove(HIDDEN_CLASS);
    });
    return;
  }

  document.querySelectorAll(FEED_SELECTORS.join(',')).forEach((feed) => {
    feed.classList.add(HIDDEN_CLASS);
  });
}

let scheduled = false;
function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    updateFeedVisibility();
  });
}

function start() {
  const style = document.createElement('style');
  style.textContent = `.${HIDDEN_CLASS} { display: none !important; }`;
  (document.head || document.documentElement).append(style);

  updateFeedVisibility();

  const observer = new MutationObserver(scheduleUpdate);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', scheduleUpdate);
}

if (document.documentElement) {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start, { once: true });
}
