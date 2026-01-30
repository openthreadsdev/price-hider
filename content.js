const CURRENCY_PATTERN =
  /(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\s?\d[\d,.\s]*/gi;
const TRAILING_CURRENCY_PATTERN =
  /\d[\d,.\s]*\s?(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)/gi;

const COMBINED_PATTERN = new RegExp(
  `(${CURRENCY_PATTERN.source})|(${TRAILING_CURRENCY_PATTERN.source})`,
  "gi"
);

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION"
]);

// Inject CSS to handle the visual masking (non-destructive)
// When extension is disabled, CSS is not injected, so:
// - Original text becomes visible (no CSS hiding it)
// - Mask stays hidden (inline style)
function injectStyles() {
  if (document.getElementById("price-hider-styles")) {
    return;
  }
  const style = document.createElement("style");
  style.id = "price-hider-styles";
  style.textContent = `
    .price-hider-original {
      display: none !important;
    }
    .price-hider-mask {
      display: inline !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function shouldSkipTextNode(textNode) {
  const parent = textNode.parentElement;
  if (!parent) {
    return true;
  }

  if (SKIP_TAGS.has(parent.tagName)) {
    return true;
  }

  // Skip if already processed
  if (parent.hasAttribute("data-price-hider") || parent.closest("[data-price-hider]")) {
    return true;
  }

  return Boolean(parent.closest("[data-price-hider-ignore]"));
}

function hasPriceMatch(text) {
  COMBINED_PATTERN.lastIndex = 0;
  return COMBINED_PATTERN.test(text);
}

function maskTextNode(textNode) {
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return;
  }

  if (shouldSkipTextNode(textNode)) {
    return;
  }

  const original = textNode.textContent;
  if (!original || original.trim().length === 0) {
    return;
  }

  if (!hasPriceMatch(original)) {
    return;
  }

  // Non-destructive approach: create two elements for each price
  // 1. Original text (hidden by CSS when extension is enabled)
  // 2. Mask text (hidden by inline style, shown by CSS when extension is enabled)
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  COMBINED_PATTERN.lastIndex = 0;
  let match;
  while ((match = COMBINED_PATTERN.exec(original)) !== null) {
    if (match.index > lastIndex) {
      fragment.appendChild(
        document.createTextNode(original.slice(lastIndex, match.index))
      );
    }

    // Wrapper span to keep original and mask together
    const wrapper = document.createElement("span");
    wrapper.setAttribute("data-price-hider", "");

    // Original price - visible by default, hidden by injected CSS
    const originalSpan = document.createElement("span");
    originalSpan.className = "price-hider-original";
    originalSpan.textContent = match[0];
    wrapper.appendChild(originalSpan);

    // Mask - hidden by default (inline style), shown by injected CSS
    const maskSpan = document.createElement("span");
    maskSpan.className = "price-hider-mask";
    maskSpan.style.display = "none"; // Hidden when CSS is not present
    maskSpan.textContent = "•••";
    wrapper.appendChild(maskSpan);

    fragment.appendChild(wrapper);

    lastIndex = COMBINED_PATTERN.lastIndex;
  }

  if (lastIndex < original.length) {
    fragment.appendChild(document.createTextNode(original.slice(lastIndex)));
  }

  textNode.parentNode.replaceChild(fragment, textNode);
}

function walkAndMask(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let current = walker.nextNode();
  while (current) {
    maskTextNode(current);
    current = walker.nextNode();
  }
}

function maskExistingPage() {
  walkAndMask(document.body);
}

function observeMutations() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        maskTextNode(mutation.target);
      }

      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            maskTextNode(node);
            return;
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            walkAndMask(node);
          }
        });
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true
  });
}

injectStyles();
maskExistingPage();
observeMutations();
