# Price Hider Chrome Extension

This Chrome extension hides prices on the current page by masking currency amounts in text content. It works on static and dynamically updated pages.

## Run locally (Load unpacked)

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select this folder: `price-hider`.
5. Visit any webpage with prices. The prices should be masked as `•••`.

If you want to ignore a section of the page, add `data-price-hider-ignore` to a
parent element.

## Publish to the Chrome Web Store

1. Create a Chrome Web Store developer account and pay the one-time fee:
   <https://chrome.google.com/webstore/devconsole/>
2. Prepare required assets:
   - Extension icons: `16x16`, `48x48`, `128x128` PNGs.
   - Screenshots: at least one `1280x800` (or `640x400`) PNG.
   - Optional promo tiles for featured placement.
   - A short privacy policy if you collect data (this extension does not).
3. Add icons and update `manifest.json`:

```json
{
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

4. Zip the extension files:
   - Include: `manifest.json`, `content.js`, and `icons/` (if added).
   - Exclude: `.git`, `.DS_Store`, and any tooling files not needed at runtime.
5. Upload the zip in the Developer Console, fill in the listing details, and
   submit for review.

After approval, the listing will go live, and updates can be published by
uploading a new zip with a higher `version` in `manifest.json`.
