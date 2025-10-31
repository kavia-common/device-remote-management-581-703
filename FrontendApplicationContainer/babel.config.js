/**
 * Babel configuration for Jest and CRA build.
 * - Uses preset-env targeting current Node for Jest transforms.
 * - Uses preset-react with automatic runtime for React 17+ JSX transform.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};
