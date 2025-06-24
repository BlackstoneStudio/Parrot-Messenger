module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/env.ts'],
  testMatch: ['**/test/**/*.spec.ts', '**/test/**/*.test.ts'],
  testTimeout: 10000,
  moduleNameMapper: {
    '^telnyx$': '<rootDir>/test/__mocks__/telnyx.js'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
