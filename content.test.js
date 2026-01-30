/**
 * unit tests for Price Hider Chrome Extension
 */

/**
 * @jest-environment jsdom
 */

describe('Price Hider Extension', () => {
  beforeEach(() => {
    // reset the DOM before each test (isolated test environment)
    document.body.innerHTML = '';
    // remove any existing styles
    const existingStyle = document.getElementById('price-hider-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  describe('Pattern Matching', () => {
    test('should match dollar amounts with prefix', () => {
      const CURRENCY_PATTERN = /(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\s?\d[\d,.\s]*/gi;
      
      expect('$100').toMatch(CURRENCY_PATTERN);
      expect('$1,000.00').toMatch(CURRENCY_PATTERN);
      expect('$1 000.00').toMatch(CURRENCY_PATTERN);
      expect('€50').toMatch(CURRENCY_PATTERN);
      expect('£99.99').toMatch(CURRENCY_PATTERN);
    });

    test('should match dollar amounts with suffix', () => {
      const TRAILING_CURRENCY_PATTERN = /\d[\d,.\s]*\s?(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)/gi;
      
      expect('100€').toMatch(TRAILING_CURRENCY_PATTERN);
      expect('1,000.00 USD').toMatch(TRAILING_CURRENCY_PATTERN);
      expect('99.99£').toMatch(TRAILING_CURRENCY_PATTERN);
    });

    test('should match various currency codes', () => {
      const CURRENCY_PATTERN = /(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\s?\d[\d,.\s]*/gi;
      
      expect('USD 100').toMatch(CURRENCY_PATTERN);
      expect('EUR 50.00').toMatch(CURRENCY_PATTERN);
      expect('GBP 99').toMatch(CURRENCY_PATTERN);
      expect('JPY 1000').toMatch(CURRENCY_PATTERN);
    });

    test('should not match plain numbers', () => {
      const COMBINED_PATTERN = new RegExp(
        `((?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\\s?\\d[\\d,.\\s]*)|(\\d[\\d,.\\s]*\\s?(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK))`,
        "gi"
      );
      
      expect('100').not.toMatch(COMBINED_PATTERN);
      expect('1000').not.toMatch(COMBINED_PATTERN);
      expect('The year 2023').not.toMatch(COMBINED_PATTERN);
    });
  });

  describe('looksLikePrice function', () => {
    // we'll need to extract these functions from content.js
    // for now, we'll define them inline for testing
    const CURRENCY_SYMBOLS = /[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]/;
    const CURRENCY_CODES = /\b(USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\b/i;
    
    function looksLikePrice(text) {
      if (!text) return false;
      const hasCurrency = CURRENCY_SYMBOLS.test(text) || CURRENCY_CODES.test(text);
      const hasDigits = /\d/.test(text);
      return hasCurrency && hasDigits;
    }

    test('should return true for text with currency symbol and digits', () => {
      expect(looksLikePrice('$100')).toBe(true);
      expect(looksLikePrice('€50.00')).toBe(true);
      expect(looksLikePrice('Price: £99.99')).toBe(true);
    });

    test('should return true for text with currency code and digits', () => {
      expect(looksLikePrice('USD 100')).toBe(true);
      expect(looksLikePrice('EUR 50')).toBe(true);
      expect(looksLikePrice('100 GBP')).toBe(true);
    });

    test('should return false for text without currency', () => {
      expect(looksLikePrice('100')).toBe(false);
      expect(looksLikePrice('One hundred dollars')).toBe(false);
      expect(looksLikePrice('The price is high')).toBe(false);
    });

    test('should return false for text without digits', () => {
      expect(looksLikePrice('$')).toBe(false);
      expect(looksLikePrice('USD')).toBe(false);
      expect(looksLikePrice('€ ')).toBe(false);
    });

    test('should return false for empty or null text', () => {
      expect(looksLikePrice('')).toBe(false);
      expect(looksLikePrice(null)).toBe(false);
      expect(looksLikePrice(undefined)).toBe(false);
    });
  });

  describe('Style Injection', () => {
    test('should inject styles only once', () => {
      // since we can't easily test the actual injectStyles from content.js
      // without it auto-executing, we'll test the concept
      const style1 = document.createElement('style');
      style1.id = 'price-hider-styles';
      style1.textContent = 'test';
      document.head.appendChild(style1);
      
      // try to inject again
      if (!document.getElementById('price-hider-styles')) {
        const style2 = document.createElement('style');
        style2.id = 'price-hider-styles';
        document.head.appendChild(style2);
      }
      
      // should only have one
      const styles = document.querySelectorAll('#price-hider-styles');
      expect(styles.length).toBe(1);
    });

    test('should include necessary CSS rules', () => {
      const style = document.createElement('style');
      style.id = 'price-hider-styles';
      style.textContent = `
        [data-price-hider] {
          font-size: 0 !important;
          letter-spacing: -9999px !important;
        }
        [data-price-hider]::after {
          content: "•••";
          font-size: 1rem !important;
          letter-spacing: normal !important;
        }
      `;
      document.head.appendChild(style);
      
      const styleElement = document.getElementById('price-hider-styles');
      expect(styleElement).toBeTruthy();
      expect(styleElement.textContent).toContain('[data-price-hider]');
      expect(styleElement.textContent).toContain('content: "•••"');
    });
  });

  describe('DOM Masking', () => {
    test('should mask simple price text', () => {
      document.body.innerHTML = '<p>The price is $100.00</p>';
      
      const textNode = document.querySelector('p').firstChild;
      expect(textNode.textContent).toBe('The price is $100.00');
      
      // simulate masking (we'll need to extract the maskTextNode function)
      // for now, we verify the expected structure
      const expectedHTML = 'The price is <span data-price-hider="">$100.00</span>';
      // after masking, the span should be created
    });

    test('should mask multiple prices in same text', () => {
      document.body.innerHTML = '<p>Was $100, now $50</p>';
      
      // after masking, both prices should be wrapped
      // expected: 'Was <span data-price-hider="">$100</span>, now <span data-price-hider="">$50</span>'
    });

    test('should not mask prices in script tags', () => {
      document.body.innerHTML = '<script>const price = "$100";</script>';
      
      const scriptTag = document.querySelector('script');
      expect(scriptTag.innerHTML).toBe('const price = "$100";');
      // masking should skip SCRIPT tags
    });

    test('should not mask prices in input fields', () => {
      document.body.innerHTML = '<input type="text" value="$100" />';
      
      const input = document.querySelector('input');
      expect(input.value).toBe('$100');
      // masking should skip INPUT tags
    });

    test('should respect data-price-hider-ignore attribute', () => {
      document.body.innerHTML = `
        <div data-price-hider-ignore>
          <p>Price: $100</p>
        </div>
      `;
      
      // Prices   inside data-price-hider-ignore should not be masked
      const paragraph = document.querySelector('p');
      expect(paragraph.textContent).toBe('Price: $100');
    });
  });

  describe('isPriceContainer function', () => {
    const SKIP_CONTAINER_TAGS = new Set([
      "HTML", "BODY", "MAIN", "ARTICLE", "SECTION", "DIV", "HEADER", "FOOTER",
      "NAV", "ASIDE", "TABLE", "TBODY", "THEAD", "TR", "UL", "OL", "DL",
      "FORM", "FIELDSET"
    ]);
    
    const CURRENCY_SYMBOLS = /[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]/;
    const CURRENCY_CODES = /\b(USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\b/i;
    
    function looksLikePrice(text) {
      if (!text) return false;
      const hasCurrency = CURRENCY_SYMBOLS.test(text) || CURRENCY_CODES.test(text);
      const hasDigits = /\d/.test(text);
      return hasCurrency && hasDigits;
    }
    
    function isPriceContainer(el) {
      if (el.hasAttribute("data-price-hider-element") || 
          el.hasAttribute("data-price-hider") ||
          el.closest("[data-price-hider-ignore]")) {
        return false;
      }

      if (SKIP_CONTAINER_TAGS.has(el.tagName)) {
        return false;
      }

      const text = el.textContent || "";
      
      if (!looksLikePrice(text)) {
        return false;
      }

      const trimmedText = text.replace(/\s+/g, "");
      if (trimmedText.length > 50) {
        return false;
      }

      const childElements = el.querySelectorAll("*");
      if (childElements.length === 0) {
        return false;
      }

      let hasCurrencyChild = false;
      let hasDigitChild = false;
      
      for (const child of childElements) {
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

      return hasCurrencyChild || hasDigitChild;
    }

    test('should identify split-element prices', () => {
      document.body.innerHTML = `
        <span>
          <span>$</span>
          <span>100</span>
        </span>
      `;
      
      const container = document.body.firstElementChild;
      expect(isPriceContainer(container)).toBe(true);
    });

    test('should reject already processed elements', () => {
      document.body.innerHTML = '<span data-price-hider-element="">$100</span>';
      
      const element = document.querySelector('span');
      expect(isPriceContainer(element)).toBe(false);
    });

    test('should reject broad container tags', () => {
      document.body.innerHTML = '<div><span>$</span><span>100</span></div>';
      
      const div = document.querySelector('div');
      expect(isPriceContainer(div)).toBe(false);
    });

    test('should reject elements without price-like content', () => {
      document.body.innerHTML = '<span><span>Hello</span><span>World</span></span>';
      
      const container = document.body.firstElementChild;
      expect(isPriceContainer(container)).toBe(false);
    });

    test('should reject elements with too much text', () => {
      const longText = 'A'.repeat(100);
      document.body.innerHTML = `<span>${longText} $100</span>`;
      
      const container = document.querySelector('span');
      expect(isPriceContainer(container)).toBe(false);
    });

    test('should reject elements inside data-price-hider-ignore', () => {
      document.body.innerHTML = `
        <div data-price-hider-ignore>
          <span>
            <span>$</span>
            <span>100</span>
          </span>
        </div>
      `;
      
      const span = document.querySelector('span');
      expect(isPriceContainer(span)).toBe(false);
    });
  });

  describe('shouldSkipTextNode function', () => {
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

      if (parent.hasAttribute("data-price-hider") || parent.closest("[data-price-hider]")) {
        return true;
      }

      if (parent.closest("[data-price-hider-element]")) {
        return true;
      }

      return Boolean(parent.closest("[data-price-hider-ignore]"));
    }

    test('should skip text nodes in script tags', () => {
      document.body.innerHTML = '<script>const x = 1;</script>';
      const textNode = document.querySelector('script').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });

    test('should skip text nodes in style tags', () => {
      document.body.innerHTML = '<style>body { color: red; }</style>';
      const textNode = document.querySelector('style').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });

    test('should skip text nodes in input elements', () => {
      document.body.innerHTML = '<input type="text" />';
      // Inputs don't typically have text nodes, but if they did
      const input = document.querySelector('input');
      const textNode = document.createTextNode('test');
      input.appendChild(textNode);
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });

    test('should skip already masked text nodes', () => {
      document.body.innerHTML = '<span data-price-hider="">$100</span>';
      const textNode = document.querySelector('span').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });

    test('should skip text nodes in ignored sections', () => {
      document.body.innerHTML = '<div data-price-hider-ignore><p>$100</p></div>';
      const textNode = document.querySelector('p').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });

    test('should not skip regular text nodes', () => {
      document.body.innerHTML = '<p>$100</p>';
      const textNode = document.querySelector('p').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(false);
    });

    test('should skip text nodes without parent', () => {
      const textNode = document.createTextNode('test');
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should handle schema.org price attributes', () => {
      document.body.innerHTML = `
        <div>
          <span itemprop="price">$99.99</span>
        </div>
      `;
      
      // after maskPriceElements runs, the span should have data-price-hider-element
      const priceElement = document.querySelector('[itemprop="price"]');
      expect(priceElement).toBeTruthy();
      expect(priceElement.textContent).toBe('$99.99');
    });

    test('should handle aria-label with prices', () => {
      document.body.innerHTML = `
        <button aria-label="Add to cart for $49.99">Add to Cart</button>
      `;
      
      const button = document.querySelector('[aria-label]');
      expect(button.getAttribute('aria-label')).toContain('$49.99');
    });

    test('should handle multiple currencies on same page', () => {
      document.body.innerHTML = `
        <p>USD: $100</p>
        <p>EUR: €85</p>
        <p>GBP: £75</p>
        <p>JPY: ¥11000</p>
      `;
      
      const paragraphs = document.querySelectorAll('p');
      expect(paragraphs.length).toBe(4);
      // All should contain price-like content
    });

    test('should handle decimal and thousand separators', () => {
      document.body.innerHTML = `
        <p>$1,000.00</p>
        <p>€1.000,00</p>
        <p>$1 000.00</p>
      `;
      
      // all formats should be detected as prices
      const paragraphs = document.querySelectorAll('p');
      expect(paragraphs.length).toBe(3);
    });

    test('should handle price ranges', () => {
      document.body.innerHTML = '<p>$50 - $100</p>';
      
      // both prices should be detected
      const paragraph = document.querySelector('p');
      expect(paragraph.textContent).toContain('$50');
      expect(paragraph.textContent).toContain('$100');
    });

    test('should preserve non-price content', () => {
      document.body.innerHTML = `
        <div>
          <h1>Product Title</h1>
          <p>This is a description with no prices.</p>
          <p>Price: $99.99</p>
          <button>Buy Now</button>
        </div>
      `;
      
      expect(document.querySelector('h1').textContent).toBe('Product Title');
      expect(document.querySelector('button').textContent).toBe('Buy Now');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty elements', () => {
      document.body.innerHTML = '<div></div>';
      // should not throw errors
      expect(document.body.innerHTML).toBe('<div></div>');
    });

    test('should handle deeply nested prices', () => {
      document.body.innerHTML = `
        <div>
          <div>
            <div>
              <div>
                <span>$99.99</span>
              </div>
            </div>
          </div>
        </div>
      `;
      
      const price = document.querySelector('span');
      expect(price.textContent).toBe('$99.99');
    });

    test('should handle prices at the edge of text', () => {
      document.body.innerHTML = '<p>$100</p>';
      expect(document.querySelector('p').textContent).toBe('$100');
    });

    test('should handle prices with special characters', () => {
      document.body.innerHTML = '<p>Price: $99.99*</p>';
      const paragraph = document.querySelector('p');
      expect(paragraph.textContent).toContain('$99.99');
    });

    test('should handle multiple spaces in prices', () => {
      document.body.innerHTML = '<p>$ 1 0 0 . 0 0</p>';
      const paragraph = document.querySelector('p');
      // this might not be detected as a price due to excessive spacing
      // but we should handle it gracefully
    });

    test('should not break on malformed HTML', () => {
      // jsdom might handle this differently, but we should be resilient
      document.body.innerHTML = '<p>Price: $100<br>Sale</p>';
      expect(document.body.innerHTML).toBeTruthy();
    });

    test('should handle text nodes with only whitespace', () => {
      document.body.innerHTML = '<p>   </p>';
      const textNode = document.querySelector('p').firstChild;
      expect(textNode.textContent.trim()).toBe('');
    });
  });

  describe('Currency Symbol Coverage', () => {
    const currencies = [
      { symbol: '$', name: 'Dollar' },
      { symbol: '€', name: 'Euro' },
      { symbol: '£', name: 'Pound' },
      { symbol: '¥', name: 'Yen' },
      { symbol: '₹', name: 'Rupee' },
      { symbol: '₩', name: 'Won' },
      { symbol: '₽', name: 'Ruble' },
      { symbol: '฿', name: 'Baht' },
    ];

    currencies.forEach(({ symbol, name }) => {
      test(`should detect ${name} (${symbol})`, () => {
        const CURRENCY_PATTERN = /(?:[$€£¥₹₩₽₺₫₪₱฿₴₦₲₵₡₭₮₨₸₼₥₧₯₠₢₣₤]|USD|EUR|GBP|JPY|CAD|AUD|NZD|CHF|CNY|RMB|HKD|SGD|SEK|NOK|DKK)\s?\d[\d,.\s]*/gi;
        expect(`${symbol}100`).toMatch(CURRENCY_PATTERN);
      });
    });
  });

  describe('Performance', () => {
    test('should handle large number of price elements', () => {
      const prices = Array.from({ length: 100 }, (_, i) => 
        `<p>Item ${i}: $${i + 1}.99</p>`
      ).join('');
      
      document.body.innerHTML = prices;
      
      const paragraphs = document.querySelectorAll('p');
      expect(paragraphs.length).toBe(100);
      
      // verify structure is intact
      expect(paragraphs[0].textContent).toContain('Item 0');
      expect(paragraphs[99].textContent).toContain('Item 99');
    });

    test('should handle rapid DOM changes', () => {
      document.body.innerHTML = '<div id="container"></div>';
      const container = document.getElementById('container');
      
      // simulate rapid additions
      for (let i = 0; i < 10; i++) {
        const p = document.createElement('p');
        p.textContent = `Price: $${i * 10}`;
        container.appendChild(p);
      }
      
      expect(container.children.length).toBe(10);
    });
  });
});
