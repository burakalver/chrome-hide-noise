// LinkedIn home feed hider. See feed-hider.js for how it works.

hideHomeFeed({
  // Only /feed: logged-in visitors to / are redirected there, while / itself
  // is the logged-out landing page with the sign-in form.
  isHomeFeed: (path) => /^\/feed\/?$/.test(path),
  selectors: [
    'main',
    '[role="main"]',
    '.scaffold-layout__main',
    '.scaffold-finite-scroll',
    '[data-view-name="feed"]',
    '.feed-shared-update-v2',
    '[data-urn^="urn:li:activity"]',
  ],
});
