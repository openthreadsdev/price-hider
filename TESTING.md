# Testing

This directory contains comprehensive unit and integration tests for the Price Hider extension.

## Setup

Install the test dependencies:

```bash
npm install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode (useful during development):
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Test Structure

### `content.test.js`
Unit tests covering individual functions and components:
- Pattern matching (currency detection)
- `looksLikePrice()` function
- `isPriceContainer()` function
- `shouldSkipTextNode()` function
- Style injection
- DOM masking logic
- Edge cases and error handling
- Currency symbol coverage
- Performance tests

### `content.integration.test.js`
Integration tests covering full workflows:
- Complete masking pipeline
- Real-world scenarios (e-commerce, shopping carts, etc.)
- Element-level and text-level masking coordination
- Schema.org and accessibility attribute handling
- Data attribute respect (ignore sections)
- Document structure preservation

## Coverage Goals

The test suite aims for:
- 70%+ line coverage
- 70%+ branch coverage
- 70%+ function coverage
- 70%+ statement coverage

## Writing Tests

When adding new features:

1. Add unit tests for individual functions in `content.test.js`
2. Add integration tests for complete workflows in `content.integration.test.js`
3. Test both happy paths and edge cases
4. Ensure tests are isolated (use `beforeEach` to reset state)

## Testing Strategy

The tests use:
- **Jest** as the test runner and assertion library
- **jsdom** to simulate browser DOM environment
- **@testing-library/dom** for DOM testing utilities

All tests run in a simulated browser environment, allowing us to test DOM manipulation, CSS injection, and mutation observers without requiring an actual browser.
