// Facebook home feed hider. See feed-hider.js for how it works.

hideHomeFeed({
  isHomeFeed: (path) => path === '/' || path === '/home.php',
  selectors: [
    '[role="main"]',
    '#contentArea',
    '[role="feed"]',
    '[data-pagelet="Feed"]',
    '[data-pagelet^="FeedUnit_"]',
    '[role="article"]',
  ],
});
