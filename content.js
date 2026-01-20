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

// inject CSS to handle the visual masking (non-destructive)
function injectStyles() {
  if (document.getElementById("price-hider-styles")) {
    return;
  }
  const style = document.createElement("style");
  style.id = "price-hider-styles";
  style.textContent = `
    [data-price-hider-original] {
      font-size: 0 !important;
      visibility: hidden !important;
    }
    [data-price-hider-original]::before {
      content: "•••";
      font-size: initial !important;
      font-size: 1rem !important;
      visibility: visible !important;
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

  // skip if already processed
  if (parent.hasAttribute("data-price-hider-original")) {
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

  // wrap prices in spans with data attributes, so
  // the original text is preserved; CSS handles the visual masking
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

    // create a span that preserves the original price in DOM
    const span = document.createElement("span");
    span.setAttribute("data-price-hider-original", match[0]);
    span.textContent = match[0];
    fragment.appendChild(span);

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
