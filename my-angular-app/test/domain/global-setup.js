// @ts-check
/**
 * global-setup.js — runs ONCE before all test files.
 * Resets coverage temp files so accumulation starts clean.
 */
const { resetCoverage } = require('./coverage-helper');

module.exports = function globalSetup() {
  resetCoverage();
};
