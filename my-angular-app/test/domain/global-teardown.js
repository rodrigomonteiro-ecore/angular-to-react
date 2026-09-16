// @ts-check
/**
 * global-teardown.js — runs ONCE after all test files.
 * Remaps and filters accumulated coverage into .a2r/coverage-raw.json.
 */
const { remapAndFilterCoverage } = require('./remap-coverage');

module.exports = function globalTeardown() {
  remapAndFilterCoverage();
};
