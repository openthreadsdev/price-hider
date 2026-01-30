# Quick Start Guide for Developers

## Setting Up the Development Environment

### 1. Clone and Install
```bash
cd price-hider
npm install
```

### 2. Run Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode (automatically re-runs on file changes)
npm run test:watch

# Generate detailed coverage report
npm run test:coverage
```

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `price-hider` directory
5. The extension is now active on all web pages

### 4. Testing Changes

After making code changes:

1. Run tests: `npm test`
2. Check coverage: `npm run test:coverage`
3. Reload extension in Chrome (click refresh icon on extension card)
4. Test on real websites (Amazon, eBay, etc.)

## Development Workflow

### Making Changes to content.js

1. Edit `content.js`
2. Run tests: `npm test`
3. Fix any failing tests
4. Update tests if you added new functionality
5. Ensure coverage stays above 70% (run `npm run test:coverage`)
6. Reload extension in browser to test manually

### Adding New Features

1. Write tests first (TDD approach):
   - Add unit tests in `content.test.js`
   - Add integration tests in `content.integration.test.js`

2. Implement the feature in `content.js`

3. Run tests and iterate until all pass

4. Check coverage and add tests for any uncovered code

### Test Organization

- **content.test.js**: Unit tests for individual functions
  - Pattern matching
  - Helper functions (looksLikePrice, isPriceContainer, etc.)
  - Edge cases

- **content.integration.test.js**: Integration tests
  - Full workflow testing
  - Real-world scenarios
  - DOM manipulation
  - Multi-step operations

## Common Commands

```bash
# Install dependencies
npm install

# Run tests (fast feedback)
npm test

# Watch mode (for active development)
npm run test:watch

# Coverage report (shows what's tested)
npm run test:coverage

# Run specific test file
npm test content.test.js

# Run tests matching a pattern
npm test -- -t "looksLikePrice"
```

## Debugging Tests

### Using console.log
```javascript
test('my test', () => {
  console.log('Debug info:', someVariable);
  expect(result).toBe(expected);
});
```

### Using debugger
```javascript
test('my test', () => {
  debugger; // Execution will pause here when running with --inspect
  expect(result).toBe(expected);
});
```

Run with Node inspector:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## File Structure

```
price-hider/
├── content.js                      # Main extension code
├── content.test.js                 # Unit tests
├── content.integration.test.js     # Integration tests
├── manifest.json                   # Extension manifest
├── package.json                    # npm dependencies
├── jest.config.js                  # Jest configuration
├── README.md                       # User documentation
├── TESTING.md                      # Testing documentation
├── TEST_SUMMARY.md                 # Test coverage summary
├── .gitignore                      # Git ignore rules
└── icons/                          # Extension icons
```

## Testing Best Practices

### 1. Test Isolation
Each test should be independent and not rely on state from other tests:
```javascript
beforeEach(() => {
  document.body.innerHTML = ''; // Reset DOM
});
```

### 2. Clear Test Names
```javascript
// Good
test('should mask prices in paragraphs', () => { ... });

// Bad
test('test1', () => { ... });
```

### 3. Test Both Paths
```javascript
test('should detect prices with currency', () => {
  expect(looksLikePrice('$100')).toBe(true);
});

test('should not detect plain numbers', () => {
  expect(looksLikePrice('100')).toBe(false);
});
```

### 4. Edge Cases Matter
```javascript
test('should handle empty input', () => {
  expect(looksLikePrice('')).toBe(false);
});

test('should handle null input', () => {
  expect(looksLikePrice(null)).toBe(false);
});
```

## Troubleshooting

### Tests Won't Run
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Coverage is Low
```bash
# Generate coverage report to see what's not covered
npm run test:coverage

# Look at the HTML report
open coverage/lcov-report/index.html
```

### Extension Not Working in Browser
1. Check Chrome DevTools console for errors
2. Ensure extension is enabled in `chrome://extensions`
3. Try reloading the extension
4. Check that manifest.json is valid JSON

### Tests Pass but Extension Doesn't Work
This indicates the tests don't cover the real-world scenario:
1. Add an integration test that replicates the issue
2. Fix the code until the test passes
3. Verify in browser again

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [jsdom Documentation](https://github.com/jsdom/jsdom)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Testing Library](https://testing-library.com/)

## Getting Help

If you encounter issues:
1. Check test output for error messages
2. Look at TEST_SUMMARY.md for coverage details
3. Review TESTING.md for testing strategy
4. Check existing tests for examples
