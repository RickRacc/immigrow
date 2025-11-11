// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',

  // make jest-dom matchers available
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'], 

  // look for tests in both the repo root and src/
  roots: ['<rootDir>', '<rootDir>/src'],

  // match *.test.js or *.test.jsx anywhere under the roots
  testMatch: ['**/*.test.(js|jsx)'],

  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
  },
};
