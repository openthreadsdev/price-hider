# Price Hider Chrome Extension

This Chrome extension hides prices on webpages by masking currency amounts in text content. It works on static and dynamically updated pages, providing a clean browsing experience without distracting price information.

## Features

### Multi-Currency Support

Automatically detects and hides prices in multiple currencies and formats:
- Symbols: $, €, £, ¥, ₹, ₩, ₽, ₺, ₫, ₪, ₱, ฿, ₴, ₦, ₲, ₵, ₡, ₭, ₮, ₨, ₸, ₼, ₥, ₧, ₯, ₠, ₢, ₣, ₤
- Currency codes: USD, EUR, GBP, JPY, CAD, AUD, NZD, CHF, CNY, RMB, HKD, SGD, SEK, NOK, DKK
- Handles both prefix format (`$100`) and suffix format (`100€`)
- Supports various number formats (commas, periods, spaces as separators)

### Smart Detection

- Text-based masking: Automatically finds and masks prices in any text content
- Site-specific optimizations: Enhanced support for popular sites like Amazon with special price element handling
- Non-destructive approach: Original price data is preserved in the DOM and only visually hidden using CSS
- Dynamic content support: Automatically detects and masks prices added after page load via AJAX/SPA updates

### Selective Ignoring

Exclude specific sections from price masking by adding `data-price-hider-ignore` to any parent element:

```html
<div data-price-hider-ignore>
  <!-- prices here won't be masked -->
  <p>Sale: $50.00</p>
</div>
```

### Privacy-Focused

- No data collection
- No external network requests
- All processing happens locally in your browser
- No permissions beyond content script injection

### Performance

- Efficient DOM traversal and mutation observation
- Skips non-relevant elements (scripts, styles, inputs, etc.)
- Minimal performance impact on page load and rendering

## Installation

### Run Locally (Load Unpacked)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select this folder: `price-hider`
5. Visit any webpage with prices - they should be masked as `•••`

## How It Works

The extension uses a combination of techniques to hide prices effectively:

1. Pattern Matching: Sophisticated regex patterns detect various price formats
2. CSS Masking: Prices are wrapped in spans and visually replaced with `•••` using CSS
3. Mutation Observer: Monitors the page for dynamic content changes
4. Element-Level Detection: Identifies known price container elements (e.g., Amazon's `.a-price` class)

When the extension is disabled or removed, all original prices automatically become visible again since the masking is CSS-based.
