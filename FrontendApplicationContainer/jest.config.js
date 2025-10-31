module.exports = {
  // Use jsdom for React component tests
  testEnvironment: 'jsdom',

  // Ensure setupTests.js is executed after the environment is set up
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],

  // Map axios to its CJS build to avoid ESM import issues with Jest
  moduleNameMapper: {
    '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs'
  },

  // Use babel-jest to transform JS/TS files so ESM/CJS interop works in Jest
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },

  // Allow transforming axios even if it's in node_modules, to handle ESM/CJS interop
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ]
};
