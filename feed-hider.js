// Home Feed Hider — shared by linkedin.js and facebook.js.
//
// Both sites are single-page apps. Rather than tagging feed elements one by
// one, this sets an attribute on <html> while on the home feed, and a
// stylesheet hides the feed containers only while that attribute is present.
// New feed content is hidden as soon as it renders, and everything comes back
// on navigation away with no cleanup.
//
// In-app navigation uses history.pushState, which content scripts can't
// observe (popstate only fires on back/forward). The DOM always changes when
// the page changes, though, so a MutationObserver re-checks the path on every
// mutation — a cheap string comparison.

const HOME_ATTR = 'data-social-feed-hider-home';

// isHomeFeed(pathname) -> boolean; selectors: feed containers to hide.
function hideHomeFeed({ isHomeFeed, selectors }) {
  const root = document.documentElement;

  // Each selector becomes its own rule, so one the browser doesn't support
  // can't invalidate the others. A container holding a password field is
  // never hidden, so a login form shown on a home URL stays usable.
  const style = document.createElement('style');
  style.textContent = selectors
    .map(
      (selector) =>
        `html[${HOME_ATTR}] ${selector}:not(:has(input[type="password"])) ` +
        '{ display: none !important; }',
    )
    .join('\n');
  // At document_start <head> doesn't exist yet; <html> works just as well.
  root.append(style);

  let lastPath = null;
  function update() {
    const path = window.location.pathname;
    if (path === lastPath) return;
    lastPath = path;
    root.toggleAttribute(HOME_ATTR, isHomeFeed(path));
  }

  update();
  new MutationObserver(update).observe(root, { childList: true, subtree: true });
  window.addEventListener('popstate', update);
}
