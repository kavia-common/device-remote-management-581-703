module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  transformIgnorePatterns: ['node_modules/(?!(axios)/)'],
  moduleNameMapper: {
    '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  }
};
