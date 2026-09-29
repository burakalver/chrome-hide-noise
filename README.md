# Social Feed Hider

A small Chrome extension that hides:

- YouTube Shorts shelves, links, tabs, and thumbnails.
- The main home feed on LinkedIn.
- The main home feed on Facebook.

So that I can go to facebook groups or marketplace or a given LinkedIn
profile or browse youtube without unwanted distractions.

LinkedIn and Facebook feeds are hidden only on their home/feed pages. The
extension changes page display only; it does not block content from loading.

## Install in Chrome

1. Download or clone this repository to your computer.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this repository folder (the one
   containing `manifest.json`).
5. Open or reload YouTube, LinkedIn, and Facebook.

After pulling updates or changing files, click the extension's **Reload**
button on `chrome://extensions`, then reload the affected website tabs.

## Sites and access

The extension runs content scripts on `youtube.com`, `linkedin.com`, and
`facebook.com`. Chrome may show that it can read and change data on these
sites; this access is needed to find and hide their page elements.

The extension requests no additional permissions, has no background service
worker, and sends no data anywhere. Its scripts only add a local display
style to matching page elements.

## How it works

- `manifest.json` — declares the supported sites and their content scripts.
- `content.js` — hides Shorts elements and watches for YouTube's dynamically
  loaded content and in-app navigation.
- `linkedin.js` and `facebook.js` — hide home-feed containers and posts as
  they appear.

## Limitations and troubleshooting

The extension relies on page markup maintained by YouTube, LinkedIn, and
Facebook, not a stable feed-hiding API. A site redesign may require selector
updates, and some page layouts may hide more or less content than intended.
The changes are cosmetic: the sites still load the content in the background.

If a feed or Shorts item remains visible:

1. Confirm the extension is enabled on `chrome://extensions`.
2. Reload the extension there, then reload the website tab.
3. Check the browser console for script errors.
4. Inspect the visible element in DevTools; the relevant content script may
   need updated selectors.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
