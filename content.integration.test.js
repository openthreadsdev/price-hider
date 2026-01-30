/**
 * Integration tests for Price Hider Chrome Extension
 * These tests use the actual functions exported from content.js
 */

const {
  CURRENCY_PATTERN,
  TRAILING_CURRENCY_PATTERN,
  COMBINED_PATTERN,
  SKIP_TAGS,
  CURRENCY_SYMBOLS,
  CURRENCY_CODES,
  SKIP_CONTAINER_TAGS,
  injectStyles,
  looksLikePrice,
  isPriceContainer,
  shouldSkipTextNode,
  hasPriceMatch,
  maskTextNode,
  maskPriceElements,
  walkAndMask,
} = require('./content.js');

describe('Price Hider - Integration Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const existingStyle = document.getElementById('price-hider-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  describe('injectStyles', () => {
    test('should inject style element into document', () => {
      injectStyles();
      const style = document.getElementById('price-hider-styles');
      expect(style).toBeTruthy();
      expect(style.tagName).toBe('STYLE');
    });

    test('should not inject styles twice', () => {
      injectStyles();
      injectStyles();
      const styles = document.querySelectorAll('#price-hider-styles');
      expect(styles.length).toBe(1);
    });

    test('should include price-hider CSS rules', () => {
      injectStyles();
      const style = document.getElementById('price-hider-styles');
      expect(style.textContent).toContain('[data-price-hider]');
      expect(style.textContent).toContain('[data-price-hider-element]');
      expect(style.textContent).toContain('content: "•••"');
      expect(style.textContent).toContain('font-size: 0');
    });
  });

  describe('looksLikePrice', () => {
    test('should return true for valid prices with symbols', () => {
      expect(looksLikePrice('$100')).toBe(true);
      expect(looksLikePrice('€50.99')).toBe(true);
      expect(looksLikePrice('£25')).toBe(true);
      expect(looksLikePrice('¥1000')).toBe(true);
      expect(looksLikePrice('Price: $99.99')).toBe(true);
    });

    test('should return true for valid prices with codes', () => {
      expect(looksLikePrice('USD 100')).toBe(true);
      expect(looksLikePrice('100 EUR')).toBe(true);
      expect(looksLikePrice('GBP 50.00')).toBe(true);
    });

    test('should return false for non-price text', () => {
      expect(looksLikePrice('100')).toBe(false);
      expect(looksLikePrice('$')).toBe(false);
      expect(looksLikePrice('USD')).toBe(false);
      expect(looksLikePrice('one hundred dollars')).toBe(false);
      expect(looksLikePrice('')).toBe(false);
      expect(looksLikePrice(null)).toBe(false);
      expect(looksLikePrice(undefined)).toBe(false);
    });
  });

  describe('isPriceContainer', () => {
    test('should identify split-element prices', () => {
      document.body.innerHTML = `
        <span id="price">
          <span class="currency">$</span>
          <span class="amount">100</span>
        </span>
      `;
      const container = document.getElementById('price');
      expect(isPriceContainer(container)).toBe(true);
    });

    test('should reject already processed elements', () => {
      document.body.innerHTML = '<span data-price-hider-element="">$100</span>';
      const element = document.querySelector('span');
      expect(isPriceContainer(element)).toBe(false);
    });

    test('should reject broad container tags', () => {
      document.body.innerHTML = '<div id="test"><span>$</span><span>100</span></div>';
      const div = document.getElementById('test');
      expect(isPriceContainer(div)).toBe(false);
    });

    test('should reject non-price content', () => {
      document.body.innerHTML = '<span><strong>Hello</strong><em>World</em></span>';
      const container = document.body.firstElementChild;
      expect(isPriceContainer(container)).toBe(false);
    });

    test('should reject elements with too much text', () => {
      const longText = 'A'.repeat(60);
      document.body.innerHTML = `<span>${longText} $100</span>`;
      const container = document.querySelector('span');
      expect(isPriceContainer(container)).toBe(false);
    });

    test('should reject elements in ignored sections', () => {
      document.body.innerHTML = `
        <div data-price-hider-ignore>
          <span><span>$</span><span>100</span></span>
        </div>
      `;
      const span = document.querySelector('span');
      expect(isPriceContainer(span)).toBe(false);
    });

    test('should reject elements without children', () => {
      document.body.innerHTML = '<span>$100</span>';
      const span = document.querySelector('span');
      expect(isPriceContainer(span)).toBe(false);
    });
  });

  describe('shouldSkipTextNode', () => {
    test('should skip text nodes in script tags', () => {
      document.body.innerHTML = '<script>const x = "$100";</script>';
      const textNode = document.querySelector('script').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });

    test('should skip text nodes in style tags', () => {
      document.body.innerHTML = '<style>.price { color: red; }</style>';
      const textNode = document.querySelector('style').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });

    test('should skip text nodes in textarea', () => {
      document.body.innerHTML = '<textarea>$100</textarea>';
      const textNode = document.querySelector('textarea').firstChild;
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

    test('should skip text nodes in element-level price containers', () => {
      document.body.innerHTML = '<div data-price-hider-element=""><span>$100</span></div>';
      const textNode = document.querySelector('span').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });

    test('should not skip regular text nodes', () => {
      document.body.innerHTML = '<p>$100</p>';
      const textNode = document.querySelector('p').firstChild;
      expect(shouldSkipTextNode(textNode)).toBe(false);
    });

    test('should skip orphaned text nodes', () => {
      const textNode = document.createTextNode('$100');
      expect(shouldSkipTextNode(textNode)).toBe(true);
    });
  });

  describe('hasPriceMatch', () => {
    test('should match various price formats', () => {
      expect(hasPriceMatch('$100')).toBe(true);
      expect(hasPriceMatch('$1,000.00')).toBe(true);
      expect(hasPriceMatch('100€')).toBe(true);
      expect(hasPriceMatch('USD 50')).toBe(true);
      expect(hasPriceMatch('50 EUR')).toBe(true);
    });

    test('should not match non-prices', () => {
      expect(hasPriceMatch('100')).toBe(false);
      expect(hasPriceMatch('hello world')).toBe(false);
      expect(hasPriceMatch('')).toBe(false);
    });
  });

  describe('maskTextNode', () => {
    test('should wrap single price in span', () => {
      document.body.innerHTML = '<p>Price: $100</p>';
      const paragraph = document.querySelector('p');
      const textNode = paragraph.firstChild;
      
      maskTextNode(textNode);
      
      const maskedSpan = paragraph.querySelector('[data-price-hider]');
      expect(maskedSpan).toBeTruthy();
      expect(maskedSpan.textContent).toBe('$100');
    });

    test('should wrap multiple prices in separate spans', () => {
      document.body.innerHTML = '<p>Was $200, now $100</p>';
      const paragraph = document.querySelector('p');
      const textNode = paragraph.firstChild;
      
      maskTextNode(textNode);
      
      const maskedSpans = paragraph.querySelectorAll('[data-price-hider]');
      expect(maskedSpans.length).toBe(2);
      expect(maskedSpans[0].textContent.trim()).toContain('$200');
      expect(maskedSpans[1].textContent.trim()).toContain('$100');
    });

    test('should preserve non-price text', () => {
      document.body.innerHTML = '<p>The item costs $50 today</p>';
      const paragraph = document.querySelector('p');
      const textNode = paragraph.firstChild;
      
      maskTextNode(textNode);
      
      expect(paragraph.textContent).toContain('The item costs');
      expect(paragraph.textContent).toContain('today');
      const maskedSpan = paragraph.querySelector('[data-price-hider]');
      expect(maskedSpan.textContent.trim()).toContain('$50');
    });

    test('should not modify text without prices', () => {
      document.body.innerHTML = '<p>Hello world</p>';
      const paragraph = document.querySelector('p');
      const originalHTML = paragraph.innerHTML;
      const textNode = paragraph.firstChild;
      
      maskTextNode(textNode);
      
      expect(paragraph.innerHTML).toBe(originalHTML);
    });

    test('should handle empty text nodes', () => {
      document.body.innerHTML = '<p></p>';
      const paragraph = document.querySelector('p');
      paragraph.appendChild(document.createTextNode(''));
      const textNode = paragraph.firstChild;
      
      expect(() => maskTextNode(textNode)).not.toThrow();
    });

    test('should skip non-text nodes', () => {
      document.body.innerHTML = '<p><span>$100</span></p>';
      const span = document.querySelector('span');
      
      expect(() => maskTextNode(span)).not.toThrow();
    });
  });

  describe('maskPriceElements', () => {
    test('should mark elements with itemprop="price"', () => {
      document.body.innerHTML = '<span itemprop="price">$99.99</span>';
      
      maskPriceElements(document.body);
      
      const element = document.querySelector('[itemprop="price"]');
      expect(element.hasAttribute('data-price-hider-element')).toBe(true);
    });

    test('should mark elements with data-price attribute', () => {
      document.body.innerHTML = '<div data-price="100">$100.00</div>';
      
      maskPriceElements(document.body);
      
      const element = document.querySelector('[data-price]');
      expect(element.hasAttribute('data-price-hider-element')).toBe(true);
    });

    test('should mark elements with aria-label containing prices', () => {
      document.body.innerHTML = '<button aria-label="Add to cart for $49.99">Add</button>';
      
      maskPriceElements(document.body);
      
      const button = document.querySelector('button');
      expect(button.hasAttribute('data-price-hider-element')).toBe(true);
    });

    test('should detect split-element prices heuristically', () => {
      document.body.innerHTML = `
        <span class="price">
          <span class="currency">$</span>
          <span class="amount">100</span>
        </span>
      `;
      
      maskPriceElements(document.body);
      
      const container = document.querySelector('.price');
      expect(container.hasAttribute('data-price-hider-element')).toBe(true);
    });

    test('should not mark elements in ignored sections', () => {
      document.body.innerHTML = `
        <div data-price-hider-ignore>
          <span itemprop="price">$99.99</span>
        </div>
      `;
      
      maskPriceElements(document.body);
      
      const element = document.querySelector('[itemprop="price"]');
      expect(element.hasAttribute('data-price-hider-element')).toBe(false);
    });

    test('should not mark already processed elements', () => {
      document.body.innerHTML = '<span itemprop="price" data-price-hider-element="">$99.99</span>';
      const element = document.querySelector('[itemprop="price"]');
      const initialValue = element.getAttribute('data-price-hider-element');
      
      maskPriceElements(document.body);
      
      // Should still have the same attribute value
      expect(element.getAttribute('data-price-hider-element')).toBe(initialValue);
    });
  });

  describe('walkAndMask - Full Integration', () => {
    test('should mask simple prices in paragraphs', () => {
      document.body.innerHTML = '<p>The price is $100.00</p>';
      
      walkAndMask(document.body);
      
      const maskedSpan = document.querySelector('[data-price-hider]');
      expect(maskedSpan).toBeTruthy();
      expect(maskedSpan.textContent).toBe('$100.00');
    });

    test('should handle nested elements with prices', () => {
      document.body.innerHTML = `
        <div>
          <h2>Product</h2>
          <p>Price: $50</p>
          <button>Buy for €45</button>
        </div>
      `;
      
      walkAndMask(document.body);
      
      const maskedSpans = document.querySelectorAll('[data-price-hider]');
      expect(maskedSpans.length).toBe(2);
    });

    test('should handle split-element prices and text prices', () => {
      document.body.innerHTML = `
        <div>
          <p>Original: $100</p>
          <span itemprop="price">
            <span>$</span>
            <span>50</span>
          </span>
        </div>
      `;
      
      walkAndMask(document.body);
      
      const textMasked = document.querySelectorAll('[data-price-hider]');
      const elementMasked = document.querySelectorAll('[data-price-hider-element]');
      
      expect(textMasked.length).toBeGreaterThan(0);
      expect(elementMasked.length).toBeGreaterThan(0);
    });

    test('should skip prices in script tags', () => {
      document.body.innerHTML = '<script>var price = "$100";</script>';
      const script = document.querySelector('script');
      const originalContent = script.textContent;
      
      walkAndMask(document.body);
      
      expect(script.textContent).toBe(originalContent);
      expect(document.querySelector('[data-price-hider]')).toBeFalsy();
    });

    test('should skip prices in input fields', () => {
      document.body.innerHTML = '<input type="text" value="$100" />';
      
      walkAndMask(document.body);
      
      const input = document.querySelector('input');
      expect(input.value).toBe('$100');
      expect(document.querySelector('[data-price-hider]')).toBeFalsy();
    });

    test('should respect data-price-hider-ignore', () => {
      document.body.innerHTML = `
        <div>
          <p>Normal: $100</p>
          <div data-price-hider-ignore>
            <p>Ignored: $50</p>
          </div>
        </div>
      `;
      
      walkAndMask(document.body);
      
      const allParagraphs = document.querySelectorAll('p');
      const normalP = allParagraphs[0];
      const ignoredP = allParagraphs[1];
      
      expect(normalP.querySelector('[data-price-hider]')).toBeTruthy();
      expect(ignoredP.querySelector('[data-price-hider]')).toBeFalsy();
      expect(ignoredP.textContent).toBe('Ignored: $50');
    });

    test('should handle multiple currencies', () => {
      document.body.innerHTML = `
        <ul>
          <li>USD: $100</li>
          <li>EUR: €85</li>
          <li>GBP: £75</li>
          <li>JPY: ¥11000</li>
        </ul>
      `;
      
      walkAndMask(document.body);
      
      const maskedSpans = document.querySelectorAll('[data-price-hider]');
      expect(maskedSpans.length).toBe(4);
    });

    test('should handle price ranges', () => {
      document.body.innerHTML = '<p>Between $50 and $100</p>';
      
      walkAndMask(document.body);
      
      const maskedSpans = document.querySelectorAll('[data-price-hider]');
      expect(maskedSpans.length).toBe(2);
      expect(maskedSpans[0].textContent.trim()).toContain('$50');
      expect(maskedSpans[1].textContent.trim()).toContain('$100');
    });

    test('should preserve document structure', () => {
      document.body.innerHTML = `
        <article>
          <header>
            <h1>Product Title</h1>
          </header>
          <section>
            <p>Description without price</p>
            <p>Price: $99.99</p>
          </section>
          <footer>
            <button>Add to Cart</button>
          </footer>
        </article>
      `;
      
      const originalStructure = {
        hasArticle: !!document.querySelector('article'),
        hasHeader: !!document.querySelector('header'),
        hasH1: !!document.querySelector('h1'),
        hasSection: !!document.querySelector('section'),
        hasFooter: !!document.querySelector('footer'),
        hasButton: !!document.querySelector('button'),
        paragraphCount: document.querySelectorAll('p').length,
      };
      
      walkAndMask(document.body);
      
      expect(!!document.querySelector('article')).toBe(originalStructure.hasArticle);
      expect(!!document.querySelector('header')).toBe(originalStructure.hasHeader);
      expect(!!document.querySelector('h1')).toBe(originalStructure.hasH1);
      expect(!!document.querySelector('section')).toBe(originalStructure.hasSection);
      expect(!!document.querySelector('footer')).toBe(originalStructure.hasFooter);
      expect(!!document.querySelector('button')).toBe(originalStructure.hasButton);
      expect(document.querySelectorAll('p').length).toBe(originalStructure.paragraphCount);
    });
  });

  describe('Real-world scenarios', () => {
    test('should handle e-commerce product listing', () => {
      document.body.innerHTML = `
        <div class="product">
          <h3>Wireless Headphones</h3>
          <div class="price-container">
            <span class="original">$199.99</span>
            <span class="sale" itemprop="price">$149.99</span>
          </div>
          <p>Free shipping on orders over $50</p>
        </div>
      `;
      
      walkAndMask(document.body);
      
      // Both prices in price-container should be masked
      const textMasked = document.querySelectorAll('[data-price-hider]');
      const elementMasked = document.querySelectorAll('[data-price-hider-element]');
      
      // At least the itemprop price should be element-masked
      expect(elementMasked.length).toBeGreaterThan(0);
      // The $50 in the free shipping text should be text-masked
      expect(textMasked.length).toBeGreaterThan(0);
    });

    test('should handle shopping cart', () => {
      document.body.innerHTML = `
        <table class="cart">
          <tr>
            <td>Item 1</td>
            <td>$25.00</td>
          </tr>
          <tr>
            <td>Item 2</td>
            <td>$30.00</td>
          </tr>
          <tr>
            <td>Total</td>
            <td>$55.00</td>
          </tr>
        </table>
      `;
      
      walkAndMask(document.body);
      
      const maskedSpans = document.querySelectorAll('[data-price-hider]');
      expect(maskedSpans.length).toBe(3);
    });

    test('should handle international pricing', () => {
      document.body.innerHTML = `
        <div class="pricing">
          <div>US: $99 USD</div>
          <div>Europe: €89 EUR</div>
          <div>UK: £79 GBP</div>
          <div>Japan: ¥11,000 JPY</div>
        </div>
      `;
      
      walkAndMask(document.body);
      
      const maskedSpans = document.querySelectorAll('[data-price-hider]');
      // Each line has 2 price indicators (symbol and code)
      expect(maskedSpans.length).toBeGreaterThan(0);
    });

    test('should handle discount labels', () => {
      document.body.innerHTML = `
        <div class="discount">
          <span>Save $20!</span>
          <span>Was $99.99, Now $79.99</span>
          <span>50% off</span>
        </div>
      `;
      
      walkAndMask(document.body);
      
      const maskedSpans = document.querySelectorAll('[data-price-hider]');
      expect(maskedSpans.length).toBe(3); // $20, $99.99, $79.99
    });
  });

  describe('Edge cases and robustness', () => {
    test('should handle malformed prices gracefully', () => {
      document.body.innerHTML = '<p>$ 1 0 0</p>';
      
      expect(() => walkAndMask(document.body)).not.toThrow();
    });

    test('should handle very long price numbers', () => {
      document.body.innerHTML = '<p>$1,234,567,890.99</p>';
      
      walkAndMask(document.body);
      
      const maskedSpan = document.querySelector('[data-price-hider]');
      expect(maskedSpan.textContent).toBe('$1,234,567,890.99');
    });

    test('should handle prices at text boundaries', () => {
      document.body.innerHTML = '<p>$100</p>';
      
      walkAndMask(document.body);
      
      const maskedSpan = document.querySelector('[data-price-hider]');
      expect(maskedSpan).toBeTruthy();
    });

    test('should handle empty document', () => {
      document.body.innerHTML = '';
      
      expect(() => walkAndMask(document.body)).not.toThrow();
    });

    test('should handle deeply nested structures', () => {
      document.body.innerHTML = `
        <div><div><div><div><div>
          <span>$100</span>
        </div></div></div></div></div>
      `;
      
      walkAndMask(document.body);
      
      const maskedSpan = document.querySelector('[data-price-hider]');
      expect(maskedSpan).toBeTruthy();
    });

    test('should handle mixed content with multiple text nodes', () => {
      const paragraph = document.createElement('p');
      paragraph.appendChild(document.createTextNode('Price: '));
      paragraph.appendChild(document.createTextNode('$100'));
      paragraph.appendChild(document.createTextNode(' today'));
      document.body.appendChild(paragraph);
      
      walkAndMask(document.body);
      
      const maskedSpan = document.querySelector('[data-price-hider]');
      expect(maskedSpan).toBeTruthy();
    });

    test('should handle unicode and special characters', () => {
      document.body.innerHTML = '<p>Preis: €99,99 ♦</p>';
      
      walkAndMask(document.body);
      
      const maskedSpan = document.querySelector('[data-price-hider]');
      expect(maskedSpan).toBeTruthy();
      expect(document.body.textContent).toContain('Preis:');
      expect(document.body.textContent).toContain('♦');
    });
  });
});
