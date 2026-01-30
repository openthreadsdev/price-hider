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

// currency symbols for heuristic detection
const CURRENCY_SYMBOLS = /[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]/;
const CURRENCY_CODES = /\b(USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\b/i;

// elements that are too broad to be price containers
const SKIP_CONTAINER_TAGS = new Set([
  "HTML", "BODY", "MAIN", "ARTICLE", "SECTION", "DIV", "HEADER", "FOOTER",
  "NAV", "ASIDE", "TABLE", "TBODY", "THEAD", "TR", "UL", "OL", "DL",
  "FORM", "FIELDSET"
]);

// inject CSS to handle the visual masking (non-destructive)
// when extension is disabled, CSS is not injected, so:
// - original text becomes visible (font-size returns to normal)
// - ::after pseudo-element doesn't render (no CSS to define it)
function injectStyles() {
  if (document.getElementById("price-hider-styles")) {
    return;
  }
  const style = document.createElement("style");
  style.id = "price-hider-styles";
  style.textContent = `
    /* Text-node based price hiding */
    [data-price-hider] {
      font-size: 0 !important;
      letter-spacing: -9999px !important;
    }
    [data-price-hider]::after {
      content: "•••";
      font-size: 1rem !important;
      letter-spacing: normal !important;
    }

    /* element-level price hiding (for split-element prices) */
    [data-price-hider-element] {
      font-size: 0 !important;
      letter-spacing: -9999px !important;
      visibility: visible !important;
    }
    [data-price-hider-element]::after {
      content: "•••";
      font-size: 1rem !important;
      letter-spacing: normal !important;
      visibility: visible !important;
    }
    /* Hide all nested elements inside price containers */
    [data-price-hider-element] * {
      visibility: hidden !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

// check if text content looks like a price (has currency + digits)
function looksLikePrice(text) {
  if (!text) return false;
  const hasCurrency = CURRENCY_SYMBOLS.test(text) || CURRENCY_CODES.test(text);
  const hasDigits = /\d/.test(text);
  return hasCurrency && hasDigits;
}

// check if an element is a good candidate for a price container
// (small, contains price-like content split across children)
function isPriceContainer(el) {
  // skip if already processed or ignored
  if (el.hasAttribute("data-price-hider-element") || 
      el.hasAttribute("data-price-hider") ||
      el.closest("[data-price-hider-ignore]")) {
    return false;
  }

  // skip broad container tags
  if (SKIP_CONTAINER_TAGS.has(el.tagName)) {
    return false;
  }

  const text = el.textContent || "";
  
  // must look like a price
  if (!looksLikePrice(text)) {
    return false;
  }

  // text should be relatively short (prices are compact)
  // this avoids matching large containers that happen to contain prices
  const trimmedText = text.replace(/\s+/g, "");
  if (trimmedText.length > 50) {
    return false;
  }

  // check if the price is split across multiple child elements
  // (e.g., currency symbol in one element, digits in another)
  const childElements = el.querySelectorAll("*");
  if (childElements.length === 0) {
    // no children - this might be a simple text element
    // Let the text-node masking handle it
    return false;
  }

  // check if currency and digits are in different text nodes/elements
  let hasCurrencyChild = false;
  let hasDigitChild = false;
  
  for (const child of childElements) {
    // only check direct text content of this element (not nested)
    const directText = Array.from(child.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent)
      .join("");
    
    if (CURRENCY_SYMBOLS.test(directText) || CURRENCY_CODES.test(directText)) {
      hasCurrencyChild = true;
    }
    if (/\d/.test(directText)) {
      hasDigitChild = true;
    }
  }

  // it's a split-element price if currency and digits are in different children
  return hasCurrencyChild || hasDigitChild;
}

// find and mark price container elements using heuristics
function maskPriceElements(root) {
  // strategy 1: Schema.org and accessibility attributes (most stable)
  const stableSelectors = [
    "[itemprop='price']:not([data-price-hider-element])",
    "[data-price]:not([data-price-hider-element])",
  ];

  stableSelectors.forEach((selector) => {
    try {
      root.querySelectorAll(selector).forEach((el) => {
        if (!el.closest("[data-price-hider-ignore]") && looksLikePrice(el.textContent)) {
          el.setAttribute("data-price-hider-element", "");
        }
      });
    } catch (e) { /* invalid selector */ }
  });

  // strategy 2: elements with aria-label containing prices
  try {
    root.querySelectorAll("[aria-label]:not([data-price-hider-element])").forEach((el) => {
      const label = el.getAttribute("aria-label") || "";
      if (looksLikePrice(label) && !el.closest("[data-price-hider-ignore]")) {
        el.setAttribute("data-price-hider-element", "");
      }
    });
  } catch (e) { /* skip */ }

  // strategy 3: heuristic detection for split-element prices
  // Look for small elements containing currency + digits across children
  try {
    // target common inline/small container elements
    const candidates = root.querySelectorAll(
      "span:not([data-price-hider-element]), " +
      "div:not([data-price-hider-element]), " +
      "p:not([data-price-hider-element]), " +
      "td:not([data-price-hider-element]), " +
      "li:not([data-price-hider-element]), " +
      "a:not([data-price-hider-element]), " +
      "strong:not([data-price-hider-element]), " +
      "b:not([data-price-hider-element]), " +
      "em:not([data-price-hider-element])"
    );

    candidates.forEach((el) => {
      if (isPriceContainer(el)) {
        // make sure we're not inside an already-marked container
        if (!el.closest("[data-price-hider-element]")) {
          el.setAttribute("data-price-hider-element", "");
        }
      }
    });
  } catch (e) { /* skip */ }
}

function shouldSkipTextNode(textNode) {
  const parent = textNode.parentElement;
  if (!parent) {
    return true;
  }

  if (SKIP_TAGS.has(parent.tagName)) {
    return true;
  }

  // skip if already processed by text-node masking (non-destructive approach)
  if (parent.hasAttribute("data-price-hider") || parent.closest("[data-price-hider]")) {
    return true;
  }

  // skip if inside an element-level price container (split-element prices)
  if (parent.closest("[data-price-hider-element]")) {
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

  // non-destructive approach: wrap price in a span
  // CSS makes the text invisible and shows "•••" via ::after pseudo-element
  // when extension is disabled, CSS is gone and original text is visible
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

    // wrapper span - CSS hides the text content and shows "•••" via ::after
    // when extension is disabled, CSS is gone so original text shows
    const wrapper = document.createElement("span");
    wrapper.setAttribute("data-price-hider", "");
    wrapper.textContent = match[0]; // original preserved in DOM

    fragment.appendChild(wrapper);

    lastIndex = COMBINED_PATTERN.lastIndex;
  }

  if (lastIndex < original.length) {
    fragment.appendChild(document.createTextNode(original.slice(lastIndex)));
  }

  textNode.parentNode.replaceChild(fragment, textNode);
}

function walkAndMask(root) {
  // first, detect and mark split-element price containers via heuristics
  if (root.nodeType === Node.ELEMENT_NODE) {
    maskPriceElements(root);
  }

  // collect all text nodes first to avoid TreeWalker issues
  // when we modify the DOM during iteration
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }
  // now process them (safe to modify DOM)
  textNodes.forEach((node) => maskTextNode(node));
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

function init() {
  injectStyles();
  if (document.body) {
    maskExistingPage();
  }
  observeMutations();
}

// ensure DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
