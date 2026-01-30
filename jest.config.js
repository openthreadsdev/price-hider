module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'content.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '**/*.test.js'
  ],
  verbose: true
};
