const CURRENCY_PATTERN =
  /(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\s?\d[\d,.\s]*/gi;
const TRAILING_CURRENCY_PATTERN =
  /\d[\d,.\s]*\s?(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)/gi;

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION"
]);

function shouldSkipTextNode(textNode) {
  const parent = textNode.parentElement;
  if (!parent) {
    return true;
  }

  if (SKIP_TAGS.has(parent.tagName)) {
    return true;
  }

  return Boolean(parent.closest("[data-price-hider-ignore]"));
}

function maskPricesInText(text) {
  const masked = text
    .replace(CURRENCY_PATTERN, "•••")
    .replace(TRAILING_CURRENCY_PATTERN, "•••");

  return masked;
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

  const masked = maskPricesInText(original);
  if (masked !== original) {
    textNode.textContent = masked;
  }
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

maskExistingPage();
observeMutations();
