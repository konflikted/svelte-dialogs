import('svelte-jester');

module.exports = {
  transform: {
    "^.+\\.svelte$": "svelte-jester",
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'svelte'],
  extensionsToTreatAsEsm: ['.svelte'],
  testPathIgnorePatterns: ['node_modules'],
  bail: false,
  verbose: true,
};