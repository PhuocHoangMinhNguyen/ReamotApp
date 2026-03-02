// Separate Jest configuration for Firestore Security Rules tests.
//
// Prerequisites:
//   1. Install the Firebase CLI:        npm install -g firebase-tools
//   2. Install the rules testing SDK:   pnpm add -D @firebase/rules-unit-testing
//   3. Start the Firestore emulator:    firebase emulators:start --only firestore
//   4. Run these tests:                 jest --config tests/backend/jest.config.js

/** @type {import('jest').Config} */
module.exports = {
  displayName:   'backend:firestore-rules',
  testEnvironment: 'node',
  testMatch:     ['<rootDir>/**/*.test.js'],
  transform:     {},           // plain CommonJS — no Babel needed here
  globalSetup:    undefined,
  globalTeardown: undefined,
  testTimeout:   15000,        // emulator calls can be slow
};
