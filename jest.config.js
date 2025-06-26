module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  setupFiles: ['./test/env.ts'],
  testMatch: ['**/test/**/*.spec.ts', '**/test/**/*.test.ts'],
  testTimeout: 10000,
  moduleNameMapper: {
    '^telnyx$': '<rootDir>/test/__mocks__/telnyx.js',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/types/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
