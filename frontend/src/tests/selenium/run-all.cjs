#!/usr/bin/env node
// Run all Selenium tests in order
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  // Import the ES module tests
  const testDir = __dirname;

  const testFiles = [
    '01-home.js',
    '02-nav-events.js',
    '03-nav-orgs.js',
    '04-nav-resources.js',
    '05-title.js',
    '06-footer.js',
    '07-events-grid.js',
    '08-orgs-grid.js',
    '09-resources-grid.js',
    '10-404.js',
  ];

  const tests = [];
  for (const file of testFiles) {
    const filePath = path.join(testDir, file);
    const fileUrl = pathToFileURL(filePath).href;
    tests.push(await import(fileUrl));
  }

  for (let i = 0; i < tests.length; i++) {
    const testModule = tests[i];
    const testFn = testModule.default;
    const testName = testFn.name || `test-${i + 1}`;

    process.stdout.write(`→ ${testName} ... `);
    try {
      await testFn();
      console.log("OK");
    } catch (e) {
      console.error("FAIL", e.message || e);
      process.exit(1);
    }
  }

  console.log("\nAll tests passed!");
  process.exit(0);
})().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
