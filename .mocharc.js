'use strict';

module.exports = {
  'allow-uncaught': false,
  'async-only': false,
  bail: false,
  'check-leaks': false,
  color: true,
  delay: false,
  diff: true,
  exit: false, // could be expressed as "'no-exit': true"
  extension: ["ts", "tsx"],
  timeout: false,
  slow: 5000,
  recursive: true,
  require: 'ts-node/register',
  //spec: ['test/**/*.test.ts'],
};